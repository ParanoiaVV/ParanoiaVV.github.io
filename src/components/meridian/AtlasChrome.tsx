import { Pause, RotateCw } from "lucide-react";
import { findPlace, formatCoords, places, type Place } from "@/components/meridian/places";

type AtlasChromeProps = {
  selectedId: string | null;
  autoOn: boolean;
  paused: boolean;
  onChoose: (id: string) => void;
  onToggleAuto: () => void;
};

function Detail({ place }: { place: Place | undefined }) {
  if (!place) {
    return (
      <div className="detail">
        <p className="detail-region">Как смотреть</p>
        <h2 className="detail-name">Возьмите мир за фонарь</h2>
        <p className="detail-blurb">
          Тяните шар мышью или пальцем — в том числе прямо за маркер. Пока вы его держите,
          автоповорот стоит. Нажмите место, и камера подойдёт по дуге.
        </p>
      </div>
    );
  }
  return (
    <div className="detail">
      <p className="detail-region">{place.region}</p>
      <h2 className="detail-name">{place.name}</h2>
      <p className="detail-blurb">{place.blurb}</p>
      <p className="detail-coords">{formatCoords(place.lat, place.lon)}</p>
    </div>
  );
}

export function AtlasChrome({ selectedId, autoOn, paused, onChoose, onToggleAuto }: AtlasChromeProps) {
  const place = findPlace(selectedId);
  let status = "Мир медленно вращается";
  if (!autoOn) status = "Автоповорот выключен";
  else if (paused) status = "Пауза — шар у вас в руках";

  return (
    <aside className="panel" aria-label="Рекомендуемые места">
      <header className="panel-head">
        <p className="eyebrow">Атлас</p>
        <h1 className="panel-title">Меридиан</h1>
        <p className="lede">Двенадцать координат, к которым мир поворачивается сам — пока вы не возьмёте его.</p>
      </header>
      <Detail place={place} />
      <div className="list-wrap">
        <ol className="place-list">
          {places.map((item) => {
            const current = item.id === selectedId;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className="place-btn"
                  aria-current={current ? "true" : undefined}
                  onClick={() => onChoose(item.id)}
                >
                  <span className="place-name">{item.name}</span>
                  <span className="place-region">{item.region}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
      <footer className="panel-foot">
        <button type="button" className="spin-btn" aria-pressed={autoOn} onClick={onToggleAuto}>
          {autoOn ? <Pause size={16} strokeWidth={1.75} aria-hidden /> : <RotateCw size={16} strokeWidth={1.75} aria-hidden />}
          {autoOn ? "Остановить вращение" : "Включить вращение"}
        </button>
        <p className="status" aria-live="polite">
          {status}
        </p>
      </footer>
    </aside>
  );
}
