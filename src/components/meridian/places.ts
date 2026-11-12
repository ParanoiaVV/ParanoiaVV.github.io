export type Place = {
  id: string;
  name: string;
  region: string;
  blurb: string;
  lat: number;
  lon: number;
};

export const places: Place[] = [
  {
    id: "kyoto",
    name: "Киото",
    region: "Япония",
    blurb: "Храмы в утреннем тумане и сады, где гравий тише голоса.",
    lat: 35.0116,
    lon: 135.7681,
  },
  {
    id: "santorini",
    name: "Санторини",
    region: "Греция",
    blurb: "Белые ступени над кальдерой и море цвета чернил.",
    lat: 36.3932,
    lon: 25.4615,
  },
  {
    id: "reykjavik",
    name: "Рейкьявик",
    region: "Исландия",
    blurb: "Пар от земли и низкое солнце, которое почти не уходит.",
    lat: 64.1466,
    lon: -21.9426,
  },
  {
    id: "marrakech",
    name: "Марракеш",
    region: "Марокко",
    blurb: "Глина медины, тень пальм и площадь, которая не спит.",
    lat: 31.6295,
    lon: -7.9811,
  },
  {
    id: "torres",
    name: "Торрес-дель-Пайне",
    region: "Чили",
    blurb: "Башни над ветром и озёра цвета холодного стекла.",
    lat: -50.9423,
    lon: -73.4068,
  },
  {
    id: "banff",
    name: "Банф",
    region: "Канада",
    blurb: "Бирюзовая вода между елями и снежными стенами.",
    lat: 51.1784,
    lon: -115.5708,
  },
  {
    id: "cappadocia",
    name: "Каппадокия",
    region: "Турция",
    blurb: "Долины, вырезанные ветром, и рассвет над скалами.",
    lat: 38.6431,
    lon: 34.8289,
  },
  {
    id: "queenstown",
    name: "Куинстаун",
    region: "Новая Зеландия",
    blurb: "Озеро в кольце хребтов, где вечер приходит резко.",
    lat: -45.0312,
    lon: 168.6626,
  },
  {
    id: "petra",
    name: "Петра",
    region: "Иордания",
    blurb: "Розовый каньон и фасад, который открывается только пешком.",
    lat: 30.3285,
    lon: 35.4444,
  },
  {
    id: "lofoten",
    name: "Лофотены",
    region: "Норвегия",
    blurb: "Дома на сваях и горы, встающие прямо из моря.",
    lat: 68.209,
    lon: 14.563,
  },
  {
    id: "amalfi",
    name: "Амальфи",
    region: "Италия",
    blurb: "Лимонные террасы и дорога, прижатая к скале.",
    lat: 40.634,
    lon: 14.6027,
  },
  {
    id: "lisbon",
    name: "Лиссабон",
    region: "Португалия",
    blurb: "Трамваи на холмах и свет, который всегда чуть тёплый.",
    lat: 38.7223,
    lon: -9.1393,
  },
];

export function findPlace(id: string | null): Place | undefined {
  if (!id) return undefined;
  return places.find((place) => place.id === id);
}

export function formatCoords(lat: number, lon: number): string {
  const ns = lat >= 0 ? "с.ш." : "ю.ш.";
  const ew = lon >= 0 ? "в.д." : "з.д.";
  return `${Math.abs(lat).toFixed(2)}° ${ns}   ${Math.abs(lon).toFixed(2)}° ${ew}`;
}
