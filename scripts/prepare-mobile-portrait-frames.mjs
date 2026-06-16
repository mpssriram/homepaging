// Prepares the portrait mobile cockpit sequence served at /cockpit-mobile-portrait.
//
// Two parts, written into the same canonical frame_NNNN.jpg scheme:
//
//   1. Base approach (frame_0001 .. frame_0120) — copied from for_mobile_portrait/
//      (true portrait render, 720x1280 / 1080x1920). Dimensions preserved.
//
//   2. Arrival ending (frame_0121 ..) — the portrait render stops mid-approach and
//      never got the desktop "cabin settle + DEV CELL CLUB transmission" beat. We
//      recover it by center-cropping the committed desktop frames
//      (public/cockpit-sequence/frame_0181..0240.webp) to 9:16 and appending them,
//      so the phone gets the same cinematic payoff as desktop. The transmission is
//      baked into those desktop frames, so it survives the crop.
//
//   npm run frames:mobile-portrait             # skips frames that already exist
//   npm run frames:mobile-portrait -- --force  # regenerates everything
//
// If the portrait source is missing/empty this warns and exits 0 so the build is
// never blocked. The ending is skipped (with a warning) if the desktop frames or
// sharp are unavailable.

import { copyFile, mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const rootDir = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const SRC = path.join(rootDir, "for_mobile_portrait");
const OUT = path.join(rootDir, "public", "cockpit-mobile-portrait");
const DESKTOP = path.join(rootDir, "public", "cockpit-sequence");

// Desktop frames (inclusive) cropped into the portrait set as the arrival ending.
const ENDING_START = 181;
const ENDING_END = 240;
// Portrait output size for the cropped ending (matches the 720x1280 base render).
const PORTRAIT_WIDTH = 720;
const PORTRAIT_HEIGHT = 1280;

const force = process.argv.includes("--force");

function frameNumber(fileName) {
  const matches = path.basename(fileName).match(/\d+/g);
  return matches ? Number.parseInt(matches.at(-1), 10) : Number.POSITIVE_INFINITY;
}

function frameName(index) {
  return `frame_${String(index).padStart(4, "0")}`;
}

async function exists(target) {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
}

async function readSourceFiles() {
  try {
    return (await readdir(SRC))
      .filter((file) => /\.jpe?g$/i.test(file))
      .sort((left, right) => frameNumber(left) - frameNumber(right));
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

// Part 1: copy the portrait approach frames. Returns the number written out
// (i.e. the highest base frame index), so the ending can be appended after it.
async function copyBaseFrames(sourceFiles) {
  let written = 0;
  let skipped = 0;

  // 1-based index matches the desktop/landscape pipelines (first sorted frame -> 0001).
  for (let index = 0; index < sourceFiles.length; index += 1) {
    const outPath = path.join(OUT, `${frameName(index + 1)}.jpg`);

    if (!force && (await exists(outPath))) {
      skipped += 1;
      continue;
    }

    await copyFile(path.join(SRC, sourceFiles[index]), outPath);
    written += 1;
  }

  console.log(
    `Portrait base frames: ${written} written, ${skipped} skipped (${sourceFiles.length} frames).`,
  );

  return sourceFiles.length;
}

// Part 2: center-crop the desktop ending to 9:16 and append it after the base set.
async function appendEnding(baseCount) {
  const firstDesktop = path.join(DESKTOP, `${frameName(ENDING_START)}.webp`);

  if (!(await exists(firstDesktop))) {
    console.warn(
      `Portrait ending: ${path.relative(rootDir, DESKTOP)} not found — skipping ` +
        "arrival ending (phone will end on the approach frame).",
    );
    return baseCount;
  }

  // Width of a 9:16 slice taken from the centre of the 16:9 desktop frame.
  const meta = await sharp(firstDesktop).metadata();
  const cropWidth = Math.round((meta.height * PORTRAIT_WIDTH) / PORTRAIT_HEIGHT);
  const cropLeft = Math.round((meta.width - cropWidth) / 2);

  let written = 0;
  let skipped = 0;
  let outIndex = baseCount;

  for (let desktop = ENDING_START; desktop <= ENDING_END; desktop += 1) {
    outIndex += 1;
    const desktopPath = path.join(DESKTOP, `${frameName(desktop)}.webp`);

    if (!(await exists(desktopPath))) {
      continue;
    }

    const outPath = path.join(OUT, `${frameName(outIndex)}.jpg`);

    if (!force && (await exists(outPath))) {
      skipped += 1;
      continue;
    }

    await sharp(desktopPath)
      .extract({ left: cropLeft, top: 0, width: cropWidth, height: meta.height })
      .resize(PORTRAIT_WIDTH, PORTRAIT_HEIGHT)
      .jpeg({ quality: 82 })
      .toFile(outPath);
    written += 1;
  }

  console.log(
    `Portrait ending: ${written} written, ${skipped} skipped -> ` +
      `frame_${String(baseCount + 1).padStart(4, "0")}..${frameName(outIndex)} ` +
      `(cropped from desktop ${ENDING_START}..${ENDING_END}).`,
  );

  return outIndex;
}

async function main() {
  const sourceFiles = await readSourceFiles();

  if (sourceFiles.length === 0) {
    console.warn(
      `Portrait mobile frames: no JPGs in ${path.relative(rootDir, SRC)} — ` +
        "skipping (drop frame_0001.jpg ... frame_0120.jpg there to enable the portrait sequence).",
    );
    return;
  }

  await mkdir(OUT, { recursive: true });

  const baseCount = await copyBaseFrames(sourceFiles);
  const total = await appendEnding(baseCount);

  console.log(
    `Portrait mobile sequence: ${total} total frames -> ${path.relative(rootDir, OUT)}.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
