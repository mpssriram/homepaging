import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type MutableRefObject } from "react";
import { useReducedMotion } from "../../../hooks/useReducedMotion";
import "./cinematic-background.css";

type NetworkNode = {
  drift: number;
  phase: number;
  radius: number;
  speed: number;
  tone: "cyan" | "red" | "soft";
  x: number;
  y: number;
};

function useLowPowerBackground() {
  const [isLowPower, setIsLowPower] = useState(false);

  useEffect(() => {
    const mediaQueries = [
      window.matchMedia("(max-width: 900px)"),
      window.matchMedia("(pointer: coarse)"),
    ];
    const update = () =>
      setIsLowPower(mediaQueries.some((mediaQuery) => mediaQuery.matches));

    update();
    mediaQueries.forEach((mediaQuery) =>
      mediaQuery.addEventListener("change", update),
    );

    return () => {
      mediaQueries.forEach((mediaQuery) =>
        mediaQuery.removeEventListener("change", update),
      );
    };
  }, []);

  return isLowPower;
}

function buildNetworkNodes(count: number): NetworkNode[] {
  return Array.from({ length: count }, (_, index) => {
    const column = index % 11;
    const row = Math.floor(index / 11);
    const jitterX = (((index * 37) % 19) - 9) / 100;
    const jitterY = (((index * 53) % 23) - 11) / 100;

    return {
      drift: 10 + (index % 5) * 4,
      phase: index * 0.67,
      radius: 1.35 + (index % 4) * 0.45,
      speed: 0.16 + (index % 7) * 0.018,
      tone: index % 9 === 0 ? "red" : index % 3 === 0 ? "soft" : "cyan",
      x: Math.min(Math.max(0.06 + column * 0.088 + jitterX, 0.04), 0.96),
      y: Math.min(Math.max(0.12 + row * 0.13 + jitterY, 0.08), 0.92),
    };
  });
}

function drawNetwork(
  canvas: HTMLCanvasElement,
  nodes: NetworkNode[],
  pointerRef: MutableRefObject<{ active: boolean; x: number; y: number }>,
  reducedMotion: boolean,
) {
  const context = canvas.getContext("2d");

  if (!context) {
    return () => undefined;
  }

  let animationFrame = 0;
  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let lastDrawTime = 0;
  const targetFrameMs = 1000 / 24;

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    pixelRatio = reducedMotion ? 1 : Math.min(window.devicePixelRatio || 1, 1.1);
    width = Math.max(Math.round(rect.width), 1);
    height = Math.max(Math.round(rect.height), 1);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  };

  const nodeCount = nodes.length;
  // Pre-allocated, reused across frames to keep the draw loop allocation-free.
  const renderPoints = nodes.map((node) => ({
    tone: node.tone,
    radius: node.radius,
    drawX: 0,
    drawY: 0,
    pull: 0,
  }));
  const nearIndices = [-1, -1, -1];
  const nearDistances = [Infinity, Infinity, Infinity];

  const draw = (time = 0) => {
    if (!reducedMotion && lastDrawTime && time - lastDrawTime < targetFrameMs) {
      animationFrame = window.requestAnimationFrame(draw);
      return;
    }

    lastDrawTime = time;
    const elapsed = time * 0.001;
    const pointer = pointerRef.current;

    for (let index = 0; index < nodeCount; index += 1) {
      const node = nodes[index];
      const orbit = reducedMotion ? 0 : Math.sin(elapsed * node.speed + node.phase) * node.drift;
      const sway = reducedMotion ? 0 : Math.cos(elapsed * (node.speed + 0.08) + node.phase) * node.drift * 0.62;
      const x = node.x * width + orbit;
      const y = node.y * height + sway;

      let pull = 0;
      if (pointer.active) {
        const pdx = pointer.x - x;
        const pdy = pointer.y - y;
        pull = Math.max(0, 1 - Math.sqrt(pdx * pdx + pdy * pdy) / 230);
      }

      const point = renderPoints[index];
      point.drawX = x + (pointer.x - x) * pull * 0.09;
      point.drawY = y + (pointer.y - y) * pull * 0.09;
      point.pull = pull;
    }

    context.clearRect(0, 0, width, height);
    context.globalCompositeOperation = "source-over";

    const horizon = context.createLinearGradient(0, height * 0.28, 0, height * 0.94);
    horizon.addColorStop(0, "rgba(2, 4, 9, 0)");
    horizon.addColorStop(0.5, "rgba(10, 28, 42, 0.2)");
    horizon.addColorStop(1, "rgba(2, 4, 9, 0)");
    context.fillStyle = horizon;
    context.fillRect(0, 0, width, height);

    context.globalCompositeOperation = "lighter";

    const linkRange = Math.min(width, 1180) * 0.2;
    const linkRangeSq = linkRange * linkRange;

    for (let index = 0; index < nodeCount; index += 1) {
      const point = renderPoints[index];
      nearIndices[0] = nearIndices[1] = nearIndices[2] = -1;
      nearDistances[0] = nearDistances[1] = nearDistances[2] = Infinity;

      // Keep the 3 nearest higher-index nodes within range, comparing squared
      // distances so sqrt only runs on the survivors below.
      for (let other = index + 1; other < nodeCount; other += 1) {
        const candidate = renderPoints[other];
        const dx = candidate.drawX - point.drawX;
        const dy = candidate.drawY - point.drawY;
        const distSq = dx * dx + dy * dy;

        if (distSq >= linkRangeSq || distSq >= nearDistances[2]) {
          continue;
        }

        let slot = 2;
        if (distSq < nearDistances[0]) {
          slot = 0;
        } else if (distSq < nearDistances[1]) {
          slot = 1;
        }

        for (let shift = 2; shift > slot; shift -= 1) {
          nearDistances[shift] = nearDistances[shift - 1];
          nearIndices[shift] = nearIndices[shift - 1];
        }

        nearDistances[slot] = distSq;
        nearIndices[slot] = other;
      }

      for (let rank = 0; rank < 3; rank += 1) {
        const otherIndex = nearIndices[rank];
        if (otherIndex === -1) {
          continue;
        }

        const candidate = renderPoints[otherIndex];
        const closeness = 1 - Math.sqrt(nearDistances[rank]) / linkRange;
        const activeBoost = Math.max(point.pull, candidate.pull);
        const redLine = point.tone === "red" || candidate.tone === "red";
        context.strokeStyle = redLine
          ? `rgba(255, 99, 124, ${0.065 + closeness * 0.18 + activeBoost * 0.2})`
          : `rgba(119, 231, 255, ${0.075 + closeness * 0.22 + activeBoost * 0.24})`;
        context.lineWidth = 0.85 + activeBoost * 1.35;
        context.beginPath();
        context.moveTo(point.drawX, point.drawY);
        context.lineTo(candidate.drawX, candidate.drawY);
        context.stroke();
      }
    }

    const routeCount = Math.min(5, nodeCount - 8);
    for (let route = 0; route < routeCount; route += 1) {
      const start = renderPoints[(route * 6 + Math.floor(elapsed * 0.25)) % nodeCount];
      const end = renderPoints[(route * 6 + 8) % nodeCount];
      const pulse = reducedMotion ? 0.6 : (Math.sin(elapsed * 1.1 + route) + 1) / 2;
      const gradient = context.createLinearGradient(start.drawX, start.drawY, end.drawX, end.drawY);
      gradient.addColorStop(0, "rgba(119, 231, 255, 0)");
      gradient.addColorStop(0.45, `rgba(119, 231, 255, ${0.05 + pulse * 0.22})`);
      gradient.addColorStop(0.52, `rgba(255, 99, 124, ${0.05 + pulse * 0.16})`);
      gradient.addColorStop(1, "rgba(119, 231, 255, 0)");
      context.strokeStyle = gradient;
      context.lineWidth = 1 + pulse * 1.1;
      context.beginPath();
      context.moveTo(start.drawX, start.drawY);
      context.lineTo((start.drawX + end.drawX) / 2, Math.min(start.drawY, end.drawY) - 42 - route * 4);
      context.lineTo(end.drawX, end.drawY);
      context.stroke();
    }

    if (pointer.active) {
      const cursorGlow = context.createRadialGradient(
        pointer.x,
        pointer.y,
        0,
        pointer.x,
        pointer.y,
        260,
      );
      cursorGlow.addColorStop(0, "rgba(119, 231, 255, 0.16)");
      cursorGlow.addColorStop(0.36, "rgba(119, 231, 255, 0.055)");
      cursorGlow.addColorStop(1, "rgba(119, 231, 255, 0)");
      context.fillStyle = cursorGlow;
      context.fillRect(0, 0, width, height);
    }

    for (const point of renderPoints) {
      const isRed = point.tone === "red";
      const alpha = point.tone === "soft" ? 0.32 : 0.48;
      const activeAlpha = alpha + point.pull * 0.42;
      context.fillStyle = isRed
        ? `rgba(255, 99, 124, ${activeAlpha})`
        : `rgba(119, 231, 255, ${activeAlpha})`;
      context.shadowColor = isRed ? "rgba(255, 99, 124, 0.34)" : "rgba(119, 231, 255, 0.4)";
      context.shadowBlur = 5 + point.pull * 10;
      context.beginPath();
      context.arc(point.drawX, point.drawY, point.radius + point.pull * 2.4, 0, Math.PI * 2);
      context.fill();
    }

    context.shadowBlur = 0;
    context.globalCompositeOperation = "source-over";

    if (!reducedMotion) {
      animationFrame = window.requestAnimationFrame(draw);
    }
  };

  resize();
  draw();

  if (typeof ResizeObserver !== "undefined") {
    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (reducedMotion) {
        draw();
      }
    });
    resizeObserver.observe(canvas);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
    };
  }

  window.addEventListener("resize", resize);

  return () => {
    window.cancelAnimationFrame(animationFrame);
    window.removeEventListener("resize", resize);
  };
}

export function CinematicBackground() {
  const reducedMotion = useReducedMotion();
  const lowPowerBackground = useLowPowerBackground();
  const shouldReduceBackground = reducedMotion || lowPowerBackground;
  const backgroundRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = useRef({ active: false, x: 0, y: 0 });
  const networkNodes = useMemo(
    () => buildNetworkNodes(shouldReduceBackground ? 26 : 36),
    [shouldReduceBackground],
  );
  const { scrollYProgress } = useScroll();

  const glowOffset = useTransform(scrollYProgress, [0, 1], [0, -56]);
  const gridOffset = useTransform(scrollYProgress, [0, 1], [0, 72]);
  const sweepOffset = useTransform(scrollYProgress, [0, 1], [0, -96]);

  useEffect(() => {
    if (shouldReduceBackground) {
      return;
    }

    let frame = 0;

    const handlePointerMove = (event: PointerEvent) => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const root = backgroundRef.current;

        if (!root) {
          return;
        }

        root.style.setProperty("--cursor-x", `${event.clientX}px`);
        root.style.setProperty("--cursor-y", `${event.clientY}px`);
        pointerRef.current = {
          active: true,
          x: event.clientX,
          y: event.clientY,
        };
      });
    };

    const handlePointerLeave = () => {
      pointerRef.current.active = false;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [shouldReduceBackground]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    return drawNetwork(canvas, networkNodes, pointerRef, shouldReduceBackground);
  }, [networkNodes, shouldReduceBackground]);

  const backgroundStyle = {
    "--cursor-x": "50vw",
    "--cursor-y": "42vh",
  } as CSSProperties;

  return (
    <div
      aria-hidden="true"
      className={`cinematic-background${shouldReduceBackground ? " cinematic-background--reduced" : ""}`}
      ref={backgroundRef}
      style={backgroundStyle}
    >
      <div className="cinematic-background__base" />
      <div className="cinematic-background__cursor-glow" />
      <canvas className="cinematic-background__network" ref={canvasRef} />
      <motion.div
        className="cinematic-background__glow cinematic-background__glow--cyan"
        style={shouldReduceBackground ? undefined : { y: glowOffset }}
      />
      <motion.div
        className="cinematic-background__glow cinematic-background__glow--magenta"
        style={shouldReduceBackground ? undefined : { y: glowOffset }}
      />
      <motion.div
        className="cinematic-background__signal-sweep"
        style={shouldReduceBackground ? undefined : { y: sweepOffset }}
      />
      <div className="cinematic-background__depth-panels">
        <span />
        <span />
        <span />
      </div>
      <motion.div
        className="cinematic-background__grid"
        style={shouldReduceBackground ? undefined : { y: gridOffset }}
      />
      <motion.div
        className="cinematic-background__horizon"
        style={shouldReduceBackground ? undefined : { y: gridOffset }}
      />
      <div className="cinematic-background__section-veil" />
      <div className="cinematic-background__noise" />
      <div className="cinematic-background__scanlines" />
      <div className="cinematic-background__vignette" />
    </div>
  );
}
