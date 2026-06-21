import { useCallback, useEffect, useRef } from "react";
import type { MutableRefObject } from "react";
import type { LoadedFrame } from "../../hooks/useImagePreloader";
import { clamp } from "../../lib/cinematicSequence";

type FitMode = "cover" | "contain";

type CockpitCanvasSequenceProps = {
  frameIndexRef: MutableRefObject<number>;
  frameCount: number;
  getNearestLoadedFrame: (targetFrame: number) => LoadedFrame | null;
  maxDevicePixelRatio?: number;
  minDevicePixelRatio?: number;
  maxCanvasPixels?: number;
  fitMode?: FitMode;
};

// Centered fit. "cover" fills the canvas (cropping the longer axis); "contain"
// fits the whole image (leaving bands on the shorter axis). Both preserve the
// image's aspect ratio — the frame is never stretched.
function computeDrawRect(
  image: HTMLImageElement,
  canvasWidth: number,
  canvasHeight: number,
  fitMode: FitMode,
) {
  const scale =
    fitMode === "cover"
      ? Math.max(canvasWidth / image.width, canvasHeight / image.height)
      : Math.min(canvasWidth / image.width, canvasHeight / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  return {
    drawWidth,
    drawHeight,
    offsetX: (canvasWidth - drawWidth) / 2,
    offsetY: (canvasHeight - drawHeight) / 2,
  };
}

export function CockpitCanvasSequence({
  frameIndexRef,
  frameCount,
  getNearestLoadedFrame,
  maxDevicePixelRatio = 1.5,
  minDevicePixelRatio = 0.75,
  maxCanvasPixels = 2_000_000,
  fitMode = "cover",
}: CockpitCanvasSequenceProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const lastImageRef = useRef<HTMLImageElement | null>(null);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const bounds = canvas.parentElement?.getBoundingClientRect();
    const cssWidth = Math.max(1, Math.round(bounds?.width ?? window.innerWidth));
    const cssHeight = Math.max(1, Math.round(bounds?.height ?? window.innerHeight));
    const cssPixels = cssWidth * cssHeight;
    const pixelBudgetRatio = Math.sqrt(maxCanvasPixels / cssPixels);
    const dpr = Math.max(
      minDevicePixelRatio,
      Math.min(window.devicePixelRatio || 1, maxDevicePixelRatio, pixelBudgetRatio),
    );
    const nextWidth = Math.round(cssWidth * dpr);
    const nextHeight = Math.round(cssHeight * dpr);

    if (canvas.width === nextWidth && canvas.height === nextHeight) {
      return;
    }

    canvas.width = nextWidth;
    canvas.height = nextHeight;
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;
    // Force a redraw on the next animation frame.
    lastImageRef.current = null;
  }, [maxCanvasPixels, maxDevicePixelRatio, minDevicePixelRatio]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => window.removeEventListener("resize", resizeCanvas);
  }, [resizeCanvas]);

  // Drive the canvas imperatively from a requestAnimationFrame loop that reads
  // scroll progress from a ref. Frame changes never trigger a React re-render.
  // The loop only runs while the hero is on-screen and the tab is visible, so
  // it costs nothing when scrolled away or backgrounded.
  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context =
      contextRef.current ??
      canvas.getContext("2d", { alpha: false, desynchronized: true });

    if (!context) {
      return;
    }

    contextRef.current = context;

    const rafIdRef: { current: number | null } = { current: null };
    const runningRef = { current: false };
    const inViewRef = { current: false };

    const draw = () => {
      const safeFrame = clamp(frameIndexRef.current, 1, frameCount);
      const loadedFrame = getNearestLoadedFrame(safeFrame);

      if (!loadedFrame || loadedFrame.image === lastImageRef.current) {
        return;
      }

      const { width, height } = canvas;
      const { drawWidth, drawHeight, offsetX, offsetY } = computeDrawRect(
        loadedFrame.image,
        width,
        height,
        fitMode,
      );

      context.setTransform(1, 0, 0, 1, 0, 0);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "medium";
      context.globalAlpha = 1;
      context.globalCompositeOperation = "source-over";
      context.filter = "none";

      if (fitMode === "contain") {
        // The wide 16:9 frame can't fill a portrait stage without cropping the
        // cockpit, so it is contained (whole frame visible, never stretched).
        // The empty bands are filled with a blurred, darkened cover of the same
        // frame so the scene reads as cinematic depth instead of a floating clip.
        const cover = computeDrawRect(loadedFrame.image, width, height, "cover");
        const blur = Math.max(12, Math.round(height * 0.05));

        context.clearRect(0, 0, width, height);
        context.filter = `blur(${blur}px) brightness(0.45) saturate(1.1)`;
        context.drawImage(
          loadedFrame.image,
          cover.offsetX,
          cover.offsetY,
          cover.drawWidth,
          cover.drawHeight,
        );
        context.filter = "none";
        // A subtle scrim deepens the bands and hides the blur's bright edges.
        context.fillStyle = "rgba(3, 6, 12, 0.35)";
        context.fillRect(0, 0, width, height);
      }

      context.drawImage(
        loadedFrame.image,
        offsetX,
        offsetY,
        drawWidth,
        drawHeight,
      );
      lastImageRef.current = loadedFrame.image;
    };

    const loop = () => {
      if (!runningRef.current) {
        return;
      }

      draw();
      rafIdRef.current = window.requestAnimationFrame(loop);
    };

    const start = () => {
      if (runningRef.current) {
        return;
      }

      runningRef.current = true;
      rafIdRef.current = window.requestAnimationFrame(loop);
    };

    const stop = () => {
      runningRef.current = false;

      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      inViewRef.current = entry.isIntersecting;

      if (entry.isIntersecting && !document.hidden) {
        start();
      } else {
        stop();
      }
    });
    observer.observe(canvas);

    const onVisibilityChange = () => {
      if (document.hidden) {
        stop();
      } else if (inViewRef.current) {
        start();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      stop();
    };
  }, [fitMode, frameCount, frameIndexRef, getNearestLoadedFrame]);

  return <canvas ref={canvasRef} aria-hidden="true" className="hero-canvas" />;
}
