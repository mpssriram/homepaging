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
  fitMode?: FitMode;
  backgroundColor?: string;
};

function computeDrawRect(
  image: HTMLImageElement,
  canvasWidth: number,
  canvasHeight: number,
  fitMode: FitMode,
) {
  const canvasRatio = canvasWidth / canvasHeight;
  const imageRatio = image.width / image.height;
  // For "cover" the image overflows the shorter axis; for "contain" it fits
  // entirely with letterboxing on the shorter axis.
  const fillHeight =
    fitMode === "cover" ? imageRatio > canvasRatio : imageRatio <= canvasRatio;

  if (fillHeight) {
    const drawHeight = canvasHeight;
    const drawWidth = image.width * (canvasHeight / image.height);
    return {
      drawWidth,
      drawHeight,
      offsetX: (canvasWidth - drawWidth) / 2,
      offsetY: 0,
    };
  }

  const drawWidth = canvasWidth;
  const drawHeight = image.height * (canvasWidth / image.width);
  return {
    drawWidth,
    drawHeight,
    offsetX: 0,
    offsetY: (canvasHeight - drawHeight) / 2,
  };
}

export function CockpitCanvasSequence({
  frameIndexRef,
  frameCount,
  getNearestLoadedFrame,
  maxDevicePixelRatio = 1.5,
  fitMode = "cover",
  backgroundColor = "#03060c",
}: CockpitCanvasSequenceProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastImageRef = useRef<HTMLImageElement | null>(null);

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
    // Force a redraw on the next animation frame.
    lastImageRef.current = null;
  }, [maxDevicePixelRatio]);

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

    const rafIdRef: { current: number | null } = { current: null };
    const runningRef = { current: false };
    const inViewRef = { current: false };

    const draw = () => {
      const safeFrame = clamp(frameIndexRef.current, 1, frameCount);
      const loadedFrame = getNearestLoadedFrame(safeFrame);

      if (!loadedFrame || loadedFrame.image === lastImageRef.current) {
        return;
      }

      const context = canvas.getContext("2d");

      if (!context) {
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

      if (fitMode === "contain") {
        // Fill letterbox space with an intentional cinematic backdrop.
        context.fillStyle = backgroundColor;
        context.fillRect(0, 0, width, height);
      } else {
        context.clearRect(0, 0, width, height);
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
  }, [backgroundColor, fitMode, frameCount, frameIndexRef, getNearestLoadedFrame]);

  return <canvas ref={canvasRef} aria-hidden="true" className="hero-canvas" />;
}
