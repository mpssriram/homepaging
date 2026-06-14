import { createServer } from "node:http";
import { spawn, spawnSync } from "node:child_process";
import { createReadStream } from "node:fs";
import {
  access,
  copyFile,
  cp,
  mkdir,
  readdir,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { constants, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const zipPath = path.join(rootDir, "cockpit-frames.zip");
const fallbackRawSource = path.join(rootDir, "finalphotos");
const tempRoot = path.join(rootDir, ".tmp", "cockpit-frames");
const rawDir = path.join(tempRoot, "raw");
const outputDir = path.join(rootDir, "public", "cockpit-sequence");
const posterPath = path.join(rootDir, "public", "cockpit-poster.webp");
const sequenceConfigPath = path.join(rootDir, "src", "lib", "cinematicSequence.ts");
const supportedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const webpQuality = 0.86;

async function exists(targetPath) {
  try {
    await access(targetPath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit", windowsHide: true });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} exited with code ${code}`));
      }
    });
  });
}

async function extractZip() {
  await rm(tempRoot, { recursive: true, force: true });
  await mkdir(rawDir, { recursive: true });

  if (await exists(zipPath)) {
    console.log(`Extracting ${path.relative(rootDir, zipPath)}...`);

    try {
      await run("tar", ["-xf", zipPath, "-C", rawDir]);
    } catch {
      await run("powershell.exe", [
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-Command",
        "Expand-Archive -LiteralPath $args[0] -DestinationPath $args[1] -Force",
        zipPath,
        rawDir,
      ]);
    }

    return;
  }

  if (await exists(fallbackRawSource)) {
    console.warn(
      "cockpit-frames.zip was not found; using finalphotos as the raw frame source.",
    );
    await cp(fallbackRawSource, rawDir, { recursive: true });
    return;
  }

  throw new Error(
    "Missing cockpit-frames.zip in the project root. Put the ZIP there and run this script again.",
  );
}

async function collectFrames(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === "__MACOSX") {
        continue;
      }

      files.push(...(await collectFrames(entryPath)));
      continue;
    }

    if (!entry.isFile() || entry.name.startsWith("._")) {
      continue;
    }

    const extension = path.extname(entry.name).toLowerCase();

    if (supportedExtensions.has(extension)) {
      files.push(entryPath);
    }
  }

  return files;
}

function numericSortValue(filePath) {
  const name = path.basename(filePath, path.extname(filePath));
  const matches = name.match(/\d+/g);

  if (!matches) {
    return Number.POSITIVE_INFINITY;
  }

  return Number.parseInt(matches.at(-1), 10);
}

function sortFrames(files) {
  return files.sort((left, right) => {
    const numberDelta = numericSortValue(left) - numericSortValue(right);

    if (numberDelta !== 0) {
      return numberDelta;
    }

    return path.basename(left).localeCompare(path.basename(right), undefined, {
      numeric: true,
      sensitivity: "base",
    });
  });
}

function findExecutable(candidates) {
  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }

    if (
      (path.isAbsolute(candidate) || candidate.includes(path.sep) || candidate.includes("/")) &&
      existsSync(candidate)
    ) {
      return candidate;
    }

    const lookup = spawnSync(process.platform === "win32" ? "where" : "which", [
      candidate,
    ]);

    if (lookup.status === 0) {
      const [firstMatch] = lookup.stdout.toString().trim().split(/\r?\n/);

      if (firstMatch) {
        return firstMatch;
      }
    }
  }

  return null;
}

function getBrowserPath() {
  const localAppData = process.env.LOCALAPPDATA;
  const programFiles = process.env.ProgramFiles;
  const programFilesX86 = process.env["ProgramFiles(x86)"];
  const candidates = [
    process.env.BROWSER_PATH,
    path.join(programFilesX86 ?? "", "Microsoft", "Edge", "Application", "msedge.exe"),
    path.join(programFiles ?? "", "Microsoft", "Edge", "Application", "msedge.exe"),
    path.join(localAppData ?? "", "Microsoft", "Edge", "Application", "msedge.exe"),
    path.join(programFiles ?? "", "Google", "Chrome", "Application", "chrome.exe"),
    path.join(programFilesX86 ?? "", "Google", "Chrome", "Application", "chrome.exe"),
    "msedge",
    "chrome",
    "google-chrome",
    "chromium",
    "chromium-browser",
  ];

  return findExecutable(candidates);
}

function createConverterPage(frameCount) {
  return `<!doctype html>
<html>
  <head><meta charset="utf-8"><title>Cockpit frame converter</title></head>
  <body>
    <canvas id="canvas"></canvas>
    <script>
      const frameCount = ${frameCount};
      const quality = ${webpQuality};
      const canvas = document.getElementById("canvas");
      const context = canvas.getContext("2d", { alpha: false });

      function toWebpBlob() {
        return new Promise((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Canvas WebP export failed."));
            }
          }, "image/webp", quality);
        });
      }

      function drawFittedText(text, x, y, maxWidth, preferredSize, minSize, family, weight) {
        let fontSize = preferredSize;

        do {
          context.font = weight + " " + fontSize + "px " + family;
          fontSize -= 2;
        } while (context.measureText(text).width > maxWidth && fontSize > minSize);

        context.fillText(text, x, y);
        return context.measureText(text).width;
      }

      function drawFinalTransmission(index) {
        const scale = Math.max(0.75, Math.min(canvas.width / 2048, canvas.height / 1080));
        const typingFrameCount = 28;
        const typingStartIndex = Math.max(0, frameCount - typingFrameCount);
        const progress = Math.max(
          0,
          Math.min(1, (index - typingStartIndex + 1) / typingFrameCount),
        );
        const centerX = canvas.width / 2;
        const topY = canvas.height * 0.32;
        const maxTextWidth = Math.min(canvas.width * 0.46, 900 * scale);
        const mainText = "DEV CELL CLUB";
        const subText = "Build. Learn. Collaborate. Launch.";
        const caretGap = 12 * scale;
        const caretWidth = 7 * scale;
        const cyan = "#66e7ff";
        const cyanBright = "#c9fbff";
        const redAccent = "#ff6b82";
        const navyShadow = "rgba(5, 14, 28, 0.94)";

        context.save();
        const hazeY = topY + 44 * scale;
        const hazeHeight = 132 * scale;
        const hazeWidth = Math.min(canvas.width * 0.66, 1180 * scale);
        const hazeLeft = centerX - hazeWidth / 2;
        const hazeGradient = context.createLinearGradient(0, hazeY, 0, hazeY + hazeHeight);
        hazeGradient.addColorStop(0, "rgba(3, 10, 18, 0)");
        hazeGradient.addColorStop(0.18, "rgba(3, 10, 18, 0.16)");
        hazeGradient.addColorStop(0.5, "rgba(3, 10, 18, 0.34)");
        hazeGradient.addColorStop(0.82, "rgba(3, 10, 18, 0.16)");
        hazeGradient.addColorStop(1, "rgba(3, 10, 18, 0)");
        context.fillStyle = hazeGradient;
        context.fillRect(hazeLeft, hazeY, hazeWidth, hazeHeight);

        context.textAlign = "center";
        context.textBaseline = "alphabetic";
        context.shadowColor = navyShadow;
        context.shadowBlur = 16 * scale;
        context.lineWidth = 3 * scale;
        context.strokeStyle = "rgba(8, 20, 34, 0.88)";
        context.fillStyle = cyan;
        context.font = "700 " + Math.round(22 * scale) + "px 'Segoe UI', 'Arial Narrow', sans-serif";
        context.letterSpacing = "5px";
        context.strokeText("CLUB TRANSMISSION", centerX, topY);
        context.fillText("CLUB TRANSMISSION", centerX, topY);

        context.letterSpacing = "0px";
        context.lineWidth = 5 * scale;
        context.strokeStyle = "rgba(8, 18, 30, 0.94)";
        context.shadowColor = "rgba(102, 231, 255, 0.38)";
        context.shadowBlur = 18 * scale;
        const mainY = topY + 72 * scale;
        let fontSize = 74 * scale;
        do {
          context.font = "700 " + fontSize + "px 'Segoe UI', 'Arial Narrow', sans-serif";
          fontSize -= 2;
        } while (context.measureText(mainText).width > maxTextWidth && fontSize > 42 * scale);
        const mainWidth = context.measureText(mainText).width;
        const titleLeft = centerX - (mainWidth + caretGap + caretWidth) / 2;
        const visibleTitleChars = Math.max(1, Math.ceil(mainText.length * progress));
        const visibleMainText = mainText.slice(0, visibleTitleChars);
        const visibleMainWidth = context.measureText(visibleMainText).width;
        const titleGradient = context.createLinearGradient(0, mainY - 58 * scale, 0, mainY + 10 * scale);
        titleGradient.addColorStop(0, "#ffffff");
        titleGradient.addColorStop(0.45, cyanBright);
        titleGradient.addColorStop(1, "#7adfff");
        context.fillStyle = titleGradient;
        context.textAlign = "left";
        context.strokeText(visibleMainText, titleLeft, mainY);
        context.fillText(visibleMainText, titleLeft, mainY);
        const caretX = titleLeft + visibleMainWidth + caretGap;
        context.shadowBlur = 12 * scale;
        context.fillStyle = redAccent;
        context.fillRect(caretX, mainY - 50 * scale, caretWidth, 58 * scale);

        context.lineWidth = 3 * scale;
        context.strokeStyle = "rgba(6, 14, 24, 0.82)";
        context.shadowColor = "rgba(3, 10, 18, 0.88)";
        context.shadowBlur = 8 * scale;
        context.fillStyle = "rgba(244, 248, 250, 0.9)";
        context.font = "500 " + Math.round(28 * scale) + "px 'Segoe UI', 'Arial Narrow', sans-serif";
        const subtitleProgress = Math.max(0, Math.min(1, (progress - 0.58) / 0.42));
        const visibleSubtitleChars = Math.max(
          0,
          Math.ceil(subText.length * subtitleProgress),
        );
        const visibleSubText = subText.slice(0, visibleSubtitleChars);
        const subtitleY = mainY + 44 * scale;
        if (visibleSubText) {
          context.strokeText(visibleSubText, titleLeft, subtitleY, maxTextWidth);
          context.fillText(visibleSubText, titleLeft, subtitleY, maxTextWidth);
        }

        context.strokeStyle = "rgba(255, 107, 130, 0.72)";
        context.lineWidth = 1.8 * scale;
        context.beginPath();
        context.moveTo(titleLeft, mainY + 22 * scale);
        context.lineTo(titleLeft + mainWidth + caretGap + caretWidth, mainY + 22 * scale);
        context.stroke();

        context.beginPath();
        context.strokeStyle = "rgba(102, 231, 255, 0.26)";
        context.lineWidth = 1.2 * scale;
        context.moveTo(centerX - 76 * scale, topY - 22 * scale);
        context.lineTo(centerX + 76 * scale, topY - 22 * scale);
        context.stroke();
        context.restore();
      }

      async function convertFrame(index) {
        const response = await fetch("/frame?index=" + index);

        if (!response.ok) {
          throw new Error("Could not read frame " + index);
        }

        const sourceBlob = await response.blob();
        const image = await createImageBitmap(sourceBlob);
        canvas.width = image.width;
        canvas.height = image.height;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0);
        image.close?.();

        if (index >= Math.max(0, frameCount - 28)) {
          drawFinalTransmission(index);
        }

        const webpBlob = await toWebpBlob();
        const name = "frame_" + String(index + 1).padStart(4, "0") + ".webp";
        const writeResponse = await fetch("/write?name=" + encodeURIComponent(name), {
          method: "POST",
          body: webpBlob,
        });

        if (!writeResponse.ok) {
          throw new Error("Could not write " + name);
        }
      }

      (async () => {
        try {
          for (let index = 0; index < frameCount; index += 1) {
            await convertFrame(index);
            document.body.textContent = "Converted " + (index + 1) + " / " + frameCount;
          }

          await fetch("/done?ok=1");
        } catch (error) {
          await fetch("/done?ok=0&message=" + encodeURIComponent(error?.message ?? String(error)));
        }
      })();
    </script>
  </body>
</html>`;
}

async function convertFramesWithBrowser(frames) {
  const browserPath = getBrowserPath();

  if (!browserPath) {
    throw new Error(
      "No Chromium-compatible browser was found. Install Edge or Chrome, or set BROWSER_PATH.",
    );
  }

  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });

  let writtenCount = 0;
  let browserConnected = false;

  const server = createServer((request, response) => {
    const url = new URL(request.url ?? "/", "http://127.0.0.1");

    if (url.pathname === "/") {
      browserConnected = true;
      console.log("Headless browser connected. Starting WebP export...");
      response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      response.end(createConverterPage(frames.length));
      return;
    }

    if (url.pathname === "/frame") {
      const index = Number.parseInt(url.searchParams.get("index") ?? "", 10);
      const framePath = frames[index];

      if (!Number.isInteger(index) || !framePath) {
        response.writeHead(404);
        response.end();
        return;
      }

      response.writeHead(200, { "content-type": "application/octet-stream" });
      createReadStream(framePath).pipe(response);
      return;
    }

    if (url.pathname === "/write") {
      const name = path.basename(url.searchParams.get("name") ?? "");

      if (!/^frame_\d{4}\.webp$/.test(name)) {
        response.writeHead(400);
        response.end();
        return;
      }

      const chunks = [];
      request.on("data", (chunk) => chunks.push(chunk));
      request.on("end", async () => {
        await writeFile(path.join(outputDir, name), Buffer.concat(chunks));
        writtenCount += 1;

        if (writtenCount === 1 || writtenCount % 20 === 0 || writtenCount === frames.length) {
          console.log(`Converted ${writtenCount} / ${frames.length}`);
        }

        response.writeHead(204);
        response.end();
      });
      return;
    }

    if (url.pathname === "/done") {
      const ok = url.searchParams.get("ok") === "1";
      const message = url.searchParams.get("message") ?? "Unknown conversion error";
      response.writeHead(204);
      response.end();
      server.emit("conversion-done", ok, message);
      return;
    }

    response.writeHead(404);
    response.end();
  });

  const port = await new Promise((resolve, reject) => {
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      resolve(server.address().port);
    });
  });

  const browser = spawn(
    browserPath,
    [
      "--headless",
      "--disable-gpu",
      "--disable-extensions",
      "--disable-background-networking",
      "--no-default-browser-check",
      "--no-first-run",
      "--no-sandbox",
      `--user-data-dir=${path.join(tempRoot, "browser-profile")}`,
      `http://127.0.0.1:${port}/`,
    ],
    { stdio: ["ignore", "ignore", "pipe"], windowsHide: true },
  );
  let timeout;
  let connectTimeout;

  try {
    await new Promise((resolve, reject) => {
      timeout = setTimeout(() => {
        reject(new Error("Timed out while converting cockpit frames."));
      }, 10 * 60 * 1000);
      connectTimeout = setTimeout(() => {
        if (!browserConnected) {
          reject(new Error("Headless browser did not connect to the converter page."));
        }
      }, 20 * 1000);

      browser.stderr?.on("data", (chunk) => {
        const message = chunk.toString().trim();

        if (message) {
          console.error(message);
        }
      });

      server.once("conversion-done", (ok, message) => {
        clearTimeout(timeout);
        clearTimeout(connectTimeout);

        if (ok) {
          resolve();
        } else {
          reject(new Error(message));
        }
      });

      browser.on("error", reject);
      browser.on("exit", (code) => {
        if (code !== 0) {
          reject(new Error(`Browser exited early with code ${code}`));
        }
      });
    });
  } finally {
    clearTimeout(timeout);
    clearTimeout(connectTimeout);
    browser.kill();
    server.close();
  }
}

async function updateSequenceConfig(frameCount) {
  const source = await readFile(sequenceConfigPath, "utf8");
  const nextSource = source
    .replace(
      /export const COCKPIT_FRAME_COUNT = \d+;/,
      `export const COCKPIT_FRAME_COUNT = ${frameCount};`,
    )
    .replace(/\.jpe?g`;/, ".webp`;");

  await writeFile(sequenceConfigPath, nextSource);
}

async function main() {
  await extractZip();

  const frames = sortFrames(await collectFrames(rawDir));

  if (frames.length === 0) {
    throw new Error("No image frames were found in the raw cockpit frame source.");
  }

  console.log(`Found ${frames.length} raw frames. Converting to WebP...`);
  await convertFramesWithBrowser(frames);

  const finalFiles = sortFrames(
    (await readdir(outputDir))
      .filter((fileName) => fileName.endsWith(".webp"))
      .map((fileName) => path.join(outputDir, fileName)),
  );

  if (finalFiles.length !== frames.length) {
    throw new Error(
      `Expected ${frames.length} WebP frames, but found ${finalFiles.length}.`,
    );
  }

  const firstFrame = path.join(outputDir, "frame_0001.webp");
  const firstFrameStats = await stat(firstFrame);

  if (!firstFrameStats.isFile()) {
    throw new Error("frame_0001.webp was not generated.");
  }

  await copyFile(firstFrame, posterPath);
  await updateSequenceConfig(finalFiles.length);

  console.log(`Generated ${finalFiles.length} WebP cockpit frames.`);
  console.log(`Poster written to ${path.relative(rootDir, posterPath)}.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
