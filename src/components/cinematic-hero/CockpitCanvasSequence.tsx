import { useCallback, useEffect, useRef, useState } from "react";
import type { LoadedFrame } from "../../hooks/useImagePreloader";
import { clamp } from "../../lib/cinematicSequence";

type CockpitCanvasSequenceProps = {
  frameIndex: number;
  frameCount: number;
  getNearestLoadedFrame: (targetFrame: number) => LoadedFrame | null;
  maxDevicePixelRatio?: number;
};

function drawObjectCover(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  canvasWidth: number,
  canvasHeight: number,
) {
  const canvasRatio = canvasWidth / canvasHeight;
  const imageRatio = image.width / image.height;
  let drawWidth: number;
  let drawHeight: number;
  let offsetX: number;
  let offsetY: number;

  if (imageRatio > canvasRatio) {
    drawHeight = canvasHeight;
    drawWidth = image.width * (canvasHeight / image.height);
    offsetX = (canvasWidth - drawWidth) / 2;
    offsetY = 0;
  } else {
    drawWidth = canvasWidth;
    drawHeight = image.height * (canvasWidth / image.width);
    offsetX = 0;
    offsetY = (canvasHeight - drawHeight) / 2;
  }

  context.clearRect(0, 0, canvasWidth, canvasHeight);
  context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
}

export function CockpitCanvasSequence({
  frameIndex,
  frameCount,
  getNearestLoadedFrame,
  maxDevicePixelRatio = 1.5,
}: CockpitCanvasSequenceProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastImageRef = useRef<HTMLImageElement | null>(null);
  const [resizeTick, setResizeTick] = useState(0);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const bounds = canvas.parentElement?.getBoundingClientRect();
    const cssWidth = Math.max(1, Math.round(bounds?.width ?? window.innerWidth));
    const cssHeight = Math.max(1, Math.round(bounds?.height ?? window.innerHeight));
    const dpr = Math.min(window.devicePixelRatio || 1, maxDevicePixelRatio);
    const nextWidth = Math.round(cssWidth * dpr);
    const nextHeight = Math.round(cssHeight * dpr);

    if (canvas.width === nextWidth && canvas.height === nextHeight) {
      return;
    }

    canvas.width = nextWidth;
    canvas.height = nextHeight;
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;
    lastImageRef.current = null;
    setResizeTick((currentTick) => currentTick + 1);
  }, [maxDevicePixelRatio]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => window.removeEventListener("resize", resizeCanvas);
  }, [resizeCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const safeFrame = clamp(frameIndex, 1, frameCount);
    const loadedFrame = getNearestLoadedFrame(safeFrame);

    if (!loadedFrame || loadedFrame.image === lastImageRef.current) {
      return;
    }

    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = window.requestAnimationFrame(() => {
      const context = canvas.getContext("2d");

      if (!context) {
        return;
      }

      context.setTransform(1, 0, 0, 1, 0, 0);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "medium";
      drawObjectCover(context, loadedFrame.image, canvas.width, canvas.height);
      lastImageRef.current = loadedFrame.image;
    });

    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [
    frameCount,
    frameIndex,
    getNearestLoadedFrame,
    resizeTick,
  ]);

  return <canvas ref={canvasRef} aria-hidden="true" className="hero-canvas" />;
}
