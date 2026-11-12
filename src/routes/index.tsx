import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState, type ComponentType } from "react";
import { AtlasChrome } from "@/components/meridian/AtlasChrome";
import type { Focus, GlobeViewProps } from "@/components/meridian/GlobeView";

export const Route = createFileRoute("/")({ component: Home });

const COOLDOWN_MS = 1100;

function Home() {
  const [Globe, setGlobe] = useState<ComponentType<GlobeViewProps> | null>(null);
  const [focus, setFocus] = useState<Focus | null>(null);
  const [autoOn, setAutoOn] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [flying, setFlying] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [failed, setFailed] = useState(false);
  const timer = useRef<number | null>(null);
  const reducedRef = useRef(false);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedRef.current = motion.matches;
    setReduced(motion.matches);
    if (motion.matches) setAutoOn(false);
    let alive = true;
    void import("@/components/meridian/GlobeView")
      .then((mod) => {
        if (alive) setGlobe(() => mod.GlobeView);
      })
      .catch(() => {
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  const armCooldown = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current);
    setCooldown(true);
    const wait = reducedRef.current ? 0 : COOLDOWN_MS;
    timer.current = window.setTimeout(() => setCooldown(false), wait);
  }, []);

  const choose = useCallback((id: string) => {
    setFocus({ id, n: Date.now() });
    setFlying(true);
    if (timer.current) window.clearTimeout(timer.current);
    setCooldown(false);
  }, []);

  const onDragChange = useCallback(
    (down: boolean) => {
      setDragging(down);
      if (down) {
        if (timer.current) window.clearTimeout(timer.current);
        setCooldown(false);
      } else {
        armCooldown();
      }
    },
    [armCooldown],
  );

  const onFlyChange = useCallback(
    (next: boolean) => {
      setFlying(next);
      if (!next) armCooldown();
    },
    [armCooldown],
  );

  const paused = dragging || flying || cooldown;
  const spinning = autoOn && !paused && !reduced;

  return (
    <main className="atlas">
      <section className="stage" aria-label="Трёхмерный мир">
        {Globe ? (
          <Globe
            focus={focus}
            spinning={spinning}
            reduced={reduced}
            onChoose={choose}
            onDragChange={onDragChange}
            onFlyChange={onFlyChange}
          />
        ) : (
          <p className="stage-note">{failed ? "Не удалось открыть сцену." : "Собираем небо…"}</p>
        )}
      </section>
      <AtlasChrome
        selectedId={focus?.id ?? null}
        autoOn={autoOn}
        paused={paused}
        onChoose={choose}
        onToggleAuto={() => setAutoOn((value) => !value)}
      />
    </main>
  );
}