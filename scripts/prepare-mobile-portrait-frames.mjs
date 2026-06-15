// Prepares the portrait mobile cockpit sequence served at /cockpit-mobile-portrait.
//
// Source frames live in for_mobile_portrait/ (any *.jpg, e.g. ezgif-frame-001.jpg
// or already frame_0001.jpg), exported from the portrait mobile video at a true
// vertical size (720x1280 or 1080x1920). They are copied and renamed to the
// canonical frame_NNNN.jpg scheme so the loader's index math is uniform with the
// desktop/landscape sets. Dimensions are preserved (no resize/stretch).
//
//   npm run frames:mobile-portrait             # skips frames that already exist
//   npm run frames:mobile-portrait -- --force  # regenerates everything
//
// If the source folder is missing or empty (the portrait frames have not been
// dropped in yet) this warns and exits 0 so the build is never blocked.

import { copyFile, mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const SRC = path.join(rootDir, "for_mobile_portrait");
const OUT = path.join(rootDir, "public", "cockpit-mobile-portrait");

const force = process.argv.includes("--force");

function frameNumber(fileName) {
  const matches = path.basename(fileName).match(/\d+/g);
  return matches ? Number.parseInt(matches.at(-1), 10) : Number.POSITIVE_INFINITY;
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

  let written = 0;
  let skipped = 0;

  // 1-based index matches the desktop/landscape pipelines (first sorted frame -> 0001).
  for (let index = 0; index < sourceFiles.length; index += 1) {
    const outName = `frame_${String(index + 1).padStart(4, "0")}.jpg`;
    const outPath = path.join(OUT, outName);

    if (!force && (await exists(outPath))) {
      skipped += 1;
      continue;
    }

    await copyFile(path.join(SRC, sourceFiles[index]), outPath);
    written += 1;
  }

  console.log(
    `Portrait mobile frames: ${written} written, ${skipped} skipped -> ${path.relative(
      rootDir,
      OUT,
    )} (${sourceFiles.length} frames).`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
