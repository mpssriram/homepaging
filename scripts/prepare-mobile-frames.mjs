// Prepares the mobile cockpit sequence served at /cockpit-mobile.
//
// Source frames live in for_mobile_version/ (ezgif-frame-001.jpg ...), exported
// from the mobile video at AUTOx480 (16:9 -> ~853x480). They are copied and
// renamed to the canonical frame_NNNN.jpg scheme so the loader's index math is
// uniform with the desktop set. Dimensions are preserved (no resize/stretch).
//
//   npm run frames:mobile             # skips frames that already exist
//   npm run frames:mobile -- --force  # regenerates everything

import { copyFile, mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const SRC = path.join(rootDir, "for_mobile_version");
const OUT = path.join(rootDir, "public", "cockpit-mobile");

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

async function main() {
  await mkdir(OUT, { recursive: true });

  const sourceFiles = (await readdir(SRC))
    .filter((file) => /\.jpe?g$/i.test(file))
    .sort((left, right) => frameNumber(left) - frameNumber(right));

  if (sourceFiles.length === 0) {
    throw new Error(`No source JPGs found in ${path.relative(rootDir, SRC)}.`);
  }

  let written = 0;
  let skipped = 0;

  // 1-based index matches the desktop pipeline (first sorted frame -> 0001).
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
    `Mobile frames: ${written} written, ${skipped} skipped -> ${path.relative(
      rootDir,
      OUT,
    )} (${sourceFiles.length} frames).`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
