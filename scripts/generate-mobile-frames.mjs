// Downscales the original finalphotos JPGs into a lightweight mobile WebP set.
// This is a pure resize of existing images (no headless rendering pipeline).
//
// Output names match the desktop sequence exactly (frame_0001.webp ...), so the
// loader's index math is identical and only the directory + resolution differ.
//
//   npm run frames:mobile           # skips frames that already exist
//   npm run frames:mobile -- --force  # regenerates everything

import { mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const rootDir = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const SRC = path.join(rootDir, "finalphotos");
const OUT = path.join(rootDir, "public", "cockpit-sequence-mobile");
const MAX_EDGE = 720;
const QUALITY = 75;

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
    const outName = `frame_${String(index + 1).padStart(4, "0")}.webp`;
    const outPath = path.join(OUT, outName);

    if (!force && (await exists(outPath))) {
      skipped += 1;
      continue;
    }

    await sharp(path.join(SRC, sourceFiles[index]))
      .resize({
        width: MAX_EDGE,
        height: MAX_EDGE,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: QUALITY })
      .toFile(outPath);
    written += 1;
  }

  console.log(
    `Mobile frames: ${written} written, ${skipped} skipped -> ${path.relative(
      rootDir,
      OUT,
    )} (${MAX_EDGE}px, q${QUALITY}).`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
