import { i as __toESM } from "../_runtime.mjs";
import { v as require_jsx_runtime, y as require_react } from "../_libs/@react-three/drei+[...].mjs";
import { n as RotateCw, r as Pause } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CpkXJEKY.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var places = [
	{
		id: "kyoto",
		name: "Киото",
		region: "Япония",
		blurb: "Храмы в утреннем тумане и сады, где гравий тише голоса.",
		lat: 35.0116,
		lon: 135.7681
	},
	{
		id: "santorini",
		name: "Санторини",
		region: "Греция",
		blurb: "Белые ступени над кальдерой и море цвета чернил.",
		lat: 36.3932,
		lon: 25.4615
	},
	{
		id: "reykjavik",
		name: "Рейкьявик",
		region: "Исландия",
		blurb: "Пар от земли и низкое солнце, которое почти не уходит.",
		lat: 64.1466,
		lon: -21.9426
	},
	{
		id: "marrakech",
		name: "Марракеш",
		region: "Марокко",
		blurb: "Глина медины, тень пальм и площадь, которая не спит.",
		lat: 31.6295,
		lon: -7.9811
	},
	{
		id: "torres",
		name: "Торрес-дель-Пайне",
		region: "Чили",
		blurb: "Башни над ветром и озёра цвета холодного стекла.",
		lat: -50.9423,
		lon: -73.4068
	},
	{
		id: "banff",
		name: "Банф",
		region: "Канада",
		blurb: "Бирюзовая вода между елями и снежными стенами.",
		lat: 51.1784,
		lon: -115.5708
	},
	{
		id: "cappadocia",
		name: "Каппадокия",
		region: "Турция",
		blurb: "Долины, вырезанные ветром, и рассвет над скалами.",
		lat: 38.6431,
		lon: 34.8289
	},
	{
		id: "queenstown",
		name: "Куинстаун",
		region: "Новая Зеландия",
		blurb: "Озеро в кольце хребтов, где вечер приходит резко.",
		lat: -45.0312,
		lon: 168.6626
	},
	{
		id: "petra",
		name: "Петра",
		region: "Иордания",
		blurb: "Розовый каньон и фасад, который открывается только пешком.",
		lat: 30.3285,
		lon: 35.4444
	},
	{
		id: "lofoten",
		name: "Лофотены",
		region: "Норвегия",
		blurb: "Дома на сваях и горы, встающие прямо из моря.",
		lat: 68.209,
		lon: 14.563
	},
	{
		id: "amalfi",
		name: "Амальфи",
		region: "Италия",
		blurb: "Лимонные террасы и дорога, прижатая к скале.",
		lat: 40.634,
		lon: 14.6027
	},
	{
		id: "lisbon",
		name: "Лиссабон",
		region: "Португалия",
		blurb: "Трамваи на холмах и свет, который всегда чуть тёплый.",
		lat: 38.7223,
		lon: -9.1393
	}
];
function findPlace(id) {
	if (!id) return void 0;
	return places.find((place) => place.id === id);
}
function formatCoords(lat, lon) {
	const ns = lat >= 0 ? "с.ш." : "ю.ш.";
	const ew = lon >= 0 ? "в.д." : "з.д.";
	return `${Math.abs(lat).toFixed(2)}° ${ns}   ${Math.abs(lon).toFixed(2)}° ${ew}`;
}
function Detail({ place }) {
	if (!place) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "detail",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "detail-region",
				children: "Как смотреть"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "detail-name",
				children: "Возьмите мир за фонарь"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "detail-blurb",
				children: "Тяните шар мышью или пальцем — в том числе прямо за маркер. Пока вы его держите, автоповорот стоит. Нажмите место, и камера подойдёт по дуге."
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "detail",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "detail-region",
				children: place.region
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "detail-name",
				children: place.name
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "detail-blurb",
				children: place.blurb
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "detail-coords",
				children: formatCoords(place.lat, place.lon)
			})
		]
	});
}
function AtlasChrome({ selectedId, autoOn, paused, onChoose, onToggleAuto }) {
	const place = findPlace(selectedId);
	let status = "Мир медленно вращается";
	if (!autoOn) status = "Автоповорот выключен";
	else if (paused) status = "Пауза — шар у вас в руках";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "panel",
		"aria-label": "Рекомендуемые места",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "panel-head",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow",
						children: "Атлас"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "panel-title",
						children: "Меридиан"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "lede",
						children: "Двенадцать координат, к которым мир поворачивается сам — пока вы не возьмёте его."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Detail, { place }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "list-wrap",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "place-list",
					children: places.map((item) => {
						const current = item.id === selectedId;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "place-btn",
							"aria-current": current ? "true" : void 0,
							onClick: () => onChoose(item.id),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "place-name",
								children: item.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "place-region",
								children: item.region
							})]
						}) }, item.id);
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
				className: "panel-foot",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "spin-btn",
					"aria-pressed": autoOn,
					onClick: onToggleAuto,
					children: [autoOn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, {
						size: 16,
						strokeWidth: 1.75,
						"aria-hidden": true
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCw, {
						size: 16,
						strokeWidth: 1.75,
						"aria-hidden": true
					}), autoOn ? "Остановить вращение" : "Включить вращение"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "status",
					"aria-live": "polite",
					children: status
				})]
			})
		]
	});
}
var routes_exports = /* @__PURE__ */ __exportAll({ component: () => Home });
var COOLDOWN_MS = 1100;
function Home() {
	const [Globe, setGlobe] = (0, import_react.useState)(null);
	const [focus, setFocus] = (0, import_react.useState)(null);
	const [autoOn, setAutoOn] = (0, import_react.useState)(true);
	const [dragging, setDragging] = (0, import_react.useState)(false);
	const [flying, setFlying] = (0, import_react.useState)(false);
	const [cooldown, setCooldown] = (0, import_react.useState)(false);
	const [reduced, setReduced] = (0, import_react.useState)(false);
	const [failed, setFailed] = (0, import_react.useState)(false);
	const timer = (0, import_react.useRef)(null);
	const reducedRef = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
		reducedRef.current = motion.matches;
		setReduced(motion.matches);
		if (motion.matches) setAutoOn(false);
		let alive = true;
		import("./GlobeView-B6zfKCn8.mjs").then((mod) => {
			if (alive) setGlobe(() => mod.GlobeView);
		}).catch(() => {
			if (alive) setFailed(true);
		});
		return () => {
			alive = false;
			if (timer.current) window.clearTimeout(timer.current);
		};
	}, []);
	const armCooldown = (0, import_react.useCallback)(() => {
		if (timer.current) window.clearTimeout(timer.current);
		setCooldown(true);
		const wait = reducedRef.current ? 0 : COOLDOWN_MS;
		timer.current = window.setTimeout(() => setCooldown(false), wait);
	}, []);
	const choose = (0, import_react.useCallback)((id) => {
		setFocus({
			id,
			n: Date.now()
		});
		setFlying(true);
		if (timer.current) window.clearTimeout(timer.current);
		setCooldown(false);
	}, []);
	const onDragChange = (0, import_react.useCallback)((down) => {
		setDragging(down);
		if (down) {
			if (timer.current) window.clearTimeout(timer.current);
			setCooldown(false);
		} else armCooldown();
	}, [armCooldown]);
	const onFlyChange = (0, import_react.useCallback)((next) => {
		setFlying(next);
		if (!next) armCooldown();
	}, [armCooldown]);
	const paused = dragging || flying || cooldown;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "atlas",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "stage",
			"aria-label": "Трёхмерный мир",
			children: Globe ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, {
				focus,
				spinning: autoOn && !paused && !reduced,
				reduced,
				onChoose: choose,
				onDragChange,
				onFlyChange
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "stage-note",
				children: failed ? "Не удалось открыть сцену." : "Собираем небо…"
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AtlasChrome, {
			selectedId: focus?.id ?? null,
			autoOn,
			paused,
			onChoose: choose,
			onToggleAuto: () => setAutoOn((value) => !value)
		})]
	});
}
//#endregion
export { findPlace as n, places as r, routes_exports as t };
