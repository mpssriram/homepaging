import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type UseImagePreloaderOptions = {
  frameCount: number;
  getFrameSrc: (index: number) => string;
  enabled?: boolean;
  batchSize?: number;
  frameStep?: number;
  startFrame?: number;
  endFrame?: number;
  maxLoadedFrames?: number;
  preloadDelayMs?: number;
};

export type LoadedFrame = {
  index: number;
  image: HTMLImageElement;
};

export function useImagePreloader({
  frameCount,
  getFrameSrc,
  enabled = true,
  batchSize = 8,
  frameStep = 1,
  startFrame = 1,
  endFrame = frameCount,
  maxLoadedFrames = Number.POSITIVE_INFINITY,
  preloadDelayMs = 64,
}: UseImagePreloaderOptions) {
  const imagesRef = useRef(new Map<number, HTMLImageElement>());
  const requestedRef = useRef(new Set<number>());
  const loadedOrderRef = useRef<number[]>([]);
  const loadedVersionRef = useRef(0);
  const nearestCacheRef = useRef<{
    targetFrame: number;
    version: number;
    result: LoadedFrame | null;
  } | null>(null);
  const [isInitialFrameReady, setIsInitialFrameReady] = useState(false);
  const safeStartFrame = useMemo(
    () => Math.min(Math.max(1, startFrame), frameCount),
    [frameCount, startFrame],
  );
  const safeEndFrame = useMemo(
    () => Math.min(Math.max(safeStartFrame, endFrame), frameCount),
    [endFrame, frameCount, safeStartFrame],
  );

  const safeFrameStep = useMemo(
    () => Math.max(1, Math.floor(frameStep)),
    [frameStep],
  );

  const snapToPreloadFrame = useCallback(
    (frame: number) => {
      if (frame <= safeStartFrame) {
        return safeStartFrame;
      }

      if (frame >= safeEndFrame) {
        return safeEndFrame;
      }

      const offset = Math.round((frame - safeStartFrame) / safeFrameStep);
      return Math.min(
        safeEndFrame,
        Math.max(safeStartFrame, safeStartFrame + offset * safeFrameStep),
      );
    },
    [safeEndFrame, safeFrameStep, safeStartFrame],
  );

  const rememberLoadedFrame = useCallback(
    (index: number, image: HTMLImageElement) => {
      imagesRef.current.set(index, image);
      loadedOrderRef.current = [
        ...loadedOrderRef.current.filter((frameIndex) => frameIndex !== index),
        index,
      ];

      while (
        loadedOrderRef.current.length > maxLoadedFrames &&
        loadedOrderRef.current.length > 0
      ) {
        const evictedFrame = loadedOrderRef.current.shift();

        if (evictedFrame !== undefined && evictedFrame !== safeStartFrame) {
          imagesRef.current.delete(evictedFrame);
          requestedRef.current.delete(evictedFrame);
        }
      }

      loadedVersionRef.current += 1;
      nearestCacheRef.current = null;

      if (index === safeStartFrame) {
        setIsInitialFrameReady(true);
      }
    },
    [maxLoadedFrames, safeStartFrame],
  );

  const orderedFrames = useMemo(() => {
    const frames = [safeStartFrame];

    if (safeEndFrame > safeStartFrame) {
      frames.push(safeEndFrame);
    }

    for (
      let index = safeStartFrame + safeFrameStep;
      index <= safeEndFrame;
      index += safeFrameStep
    ) {
      if (index !== safeEndFrame && !frames.includes(index)) {
        frames.push(index);
      }
    }

    return frames;
  }, [safeEndFrame, safeFrameStep, safeStartFrame]);

  const loadFrame = useCallback(
    (index: number) => {
      if (!enabled || requestedRef.current.has(index)) {
        return;
      }

      requestedRef.current.add(index);
      const image = new Image();
      image.decoding = "async";
      image.fetchPriority = index === safeStartFrame ? "high" : "low";

      image.onload = () => {
        const decodedImage = image.decode?.();

        if (decodedImage) {
          decodedImage.then(
            () => rememberLoadedFrame(index, image),
            () => rememberLoadedFrame(index, image),
          );
          return;
        }

        rememberLoadedFrame(index, image);
      };

      image.onerror = () => {
        requestedRef.current.delete(index);
        console.warn(`Failed to load cockpit frame: ${index}`);
      };

      image.src = getFrameSrc(index);
    },
    [enabled, getFrameSrc, rememberLoadedFrame, safeStartFrame],
  );

  const preloadFrameWindow = useCallback(
    (centerFrame: number, radius: number) => {
      if (!enabled) {
        return;
      }

      const center = snapToPreloadFrame(centerFrame);
      const candidates = new Set<number>([safeStartFrame, safeEndFrame, center]);

      for (
        let distance = safeFrameStep;
        distance <= radius;
        distance += safeFrameStep
      ) {
        candidates.add(snapToPreloadFrame(center - distance));
        candidates.add(snapToPreloadFrame(center + distance));
      }

      candidates.forEach((frameIndex) => loadFrame(frameIndex));
    },
    [
      enabled,
      loadFrame,
      safeEndFrame,
      safeFrameStep,
      safeStartFrame,
      snapToPreloadFrame,
    ],
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;
    let cursor = 0;
    let timeoutId: number | undefined;

    const loadNextBatch = () => {
      if (cancelled) {
        return;
      }

      orderedFrames
        .slice(cursor, cursor + batchSize)
        .forEach((frameIndex) => loadFrame(frameIndex));

      cursor += batchSize;

      if (cursor < orderedFrames.length) {
        timeoutId = window.setTimeout(loadNextBatch, preloadDelayMs);
      }
    };

    loadNextBatch();

    return () => {
      cancelled = true;

      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [batchSize, enabled, loadFrame, orderedFrames, preloadDelayMs]);

  useEffect(() => {
    setIsInitialFrameReady(imagesRef.current.has(safeStartFrame));
  }, [enabled, safeStartFrame]);

  const getNearestLoadedFrame = useCallback(
    (targetFrame: number): LoadedFrame | null => {
      const cached = nearestCacheRef.current;

      if (
        cached &&
        cached.targetFrame === targetFrame &&
        cached.version === loadedVersionRef.current
      ) {
        return cached.result;
      }

      const exactImage = imagesRef.current.get(targetFrame);

      if (exactImage) {
        const result = { index: targetFrame, image: exactImage };
        nearestCacheRef.current = {
          targetFrame,
          version: loadedVersionRef.current,
          result,
        };
        return result;
      }

      for (let distance = 1; distance <= frameCount; distance += 1) {
        const previous = targetFrame - distance;
        const next = targetFrame + distance;
        const previousImage = imagesRef.current.get(previous);
        const nextImage = imagesRef.current.get(next);

        if (previousImage) {
          const result = { index: previous, image: previousImage };
          nearestCacheRef.current = {
            targetFrame,
            version: loadedVersionRef.current,
            result,
          };
          return result;
        }

        if (nextImage) {
          const result = { index: next, image: nextImage };
          nearestCacheRef.current = {
            targetFrame,
            version: loadedVersionRef.current,
            result,
          };
          return result;
        }
      }

      nearestCacheRef.current = {
        targetFrame,
        version: loadedVersionRef.current,
        result: null,
      };
      return null;
    },
    [frameCount],
  );

  return {
    isInitialFrameReady,
    getNearestLoadedFrame,
    preloadFrameWindow,
  };
}
