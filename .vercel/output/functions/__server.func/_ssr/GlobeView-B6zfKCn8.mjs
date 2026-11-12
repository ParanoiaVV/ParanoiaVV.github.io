import { i as __toESM } from "../_runtime.mjs";
import { _ as Vector3, a as Canvas, d as CanvasTexture, f as Color, g as ShaderMaterial, h as SRGBColorSpace, l as BufferAttribute, m as Quaternion, n as useTexture, o as useFrame, p as MathUtils, r as Html, s as useThree, t as OrbitControls, u as BufferGeometry, v as require_jsx_runtime, y as require_react } from "../_libs/@react-three/drei+[...].mjs";
import { n as findPlace, r as places } from "./routes-CpkXJEKY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/GlobeView-B6zfKCn8.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var DEG = Math.PI / 180;
/** Matches three.js SphereGeometry: u = 0 at lon −180, v = 1 at the north pole. */
function latLonToVector(lat, lon, radius, target = new Vector3()) {
	const theta = (90 - lat) * DEG;
	const phi = (lon + 180) * DEG;
	const sinTheta = Math.sin(theta);
	return target.set(-radius * sinTheta * Math.cos(phi), radius * Math.cos(theta), radius * sinTheta * Math.sin(phi));
}
var LAMP = "#f7f3ea";
var STEM = "#d5d1c6";
var SKY = "#171d25";
var UP = new Vector3(0, 1, 0);
var ALT = new Vector3(1, 0, 0);
var _dir = new Vector3();
var _ortho = new Vector3();
function smooth(t) {
	const x = MathUtils.clamp(t, 0, 1);
	return x * x * (3 - 2 * x);
}
function slerpDir(out, a, b, t) {
	const dot = MathUtils.clamp(a.dot(b), -1, 1);
	if (dot > .9995) {
		out.copy(a).lerp(b, t).normalize();
		return;
	}
	if (dot < -.9995) {
		_ortho.crossVectors(a, Math.abs(a.y) > .9 ? ALT : UP).normalize();
		out.copy(a).lerp(b, t).addScaledVector(_ortho, Math.sin(Math.PI * t) * .4).normalize();
		return;
	}
	const theta = Math.acos(dot);
	const sinTheta = Math.sin(theta);
	const w1 = Math.sin((1 - t) * theta) / sinTheta;
	const w2 = Math.sin(t * theta) / sinTheta;
	out.copy(a).multiplyScalar(w1).addScaledVector(b, w2);
}
function useGraticule() {
	const tex = (0, import_react.useMemo)(() => {
		const canvas = document.createElement("canvas");
		canvas.width = 1024;
		canvas.height = 512;
		const ctx = canvas.getContext("2d");
		if (!ctx) throw new Error("canvas");
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.strokeStyle = "rgba(236, 234, 228, 0.55)";
		ctx.lineWidth = 1;
		for (let i = 0; i <= 12; i += 1) {
			const x = i / 12 * canvas.width + .5;
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, canvas.height);
			ctx.stroke();
		}
		for (let j = 0; j <= 6; j += 1) {
			const y = j / 6 * canvas.height + .5;
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(canvas.width, y);
			ctx.stroke();
		}
		const texture = new CanvasTexture(canvas);
		texture.colorSpace = SRGBColorSpace;
		texture.needsUpdate = true;
		return texture;
	}, []);
	(0, import_react.useEffect)(() => () => tex.dispose(), [tex]);
	return tex;
}
function Earth() {
	const [colorMap, bumpMap] = useTexture(["/textures/earth.jpg", "/textures/earth-topology.png"]);
	(0, import_react.useLayoutEffect)(() => {
		colorMap.colorSpace = SRGBColorSpace;
		colorMap.anisotropy = 8;
		bumpMap.colorSpace = "";
	}, [bumpMap, colorMap]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
		1,
		96,
		64
	] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
		map: colorMap,
		bumpMap,
		bumpScale: .028,
		roughness: 1,
		metalness: 0,
		emissive: "#f2f4f6",
		emissiveMap: colorMap,
		emissiveIntensity: .55
	})] });
}
function Graticule() {
	const map = useGraticule();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		scale: 1.004,
		renderOrder: 1,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
			1,
			64,
			48
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
			map,
			transparent: true,
			opacity: .1,
			depthWrite: false,
			polygonOffset: true,
			polygonOffsetFactor: -2,
			polygonOffsetUnits: -2
		})]
	});
}
var cloudVert = `
  varying vec3 vPos;
  void main() {
    vPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
var cloudFrag = `
  varying vec3 vPos;
  uniform float uTime;
  float hash(vec3 p) {
    p = fract(p * 0.3183099 + vec3(0.11, 0.17, 0.13));
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i), hash(i + vec3(1.0, 0.0, 0.0)), f.x),
          mix(hash(i + vec3(0.0, 1.0, 0.0)), hash(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
      mix(mix(hash(i + vec3(0.0, 0.0, 1.0)), hash(i + vec3(1.0, 0.0, 1.0)), f.x),
          mix(hash(i + vec3(0.0, 1.0, 1.0)), hash(i + vec3(1.0, 1.0, 1.0)), f.x), f.y),
      f.z);
  }
  void main() {
    vec3 p = normalize(vPos) * 3.4 + vec3(uTime * 0.015, 0.0, 0.0);
    float n = noise(p) * 0.65 + noise(p * 2.1) * 0.35;
    float cloud = smoothstep(0.62, 0.84, n);
    gl_FragColor = vec4(0.93, 0.95, 0.97, cloud * 0.1);
  }
`;
function Clouds() {
	const ref = (0, import_react.useRef)(null);
	const mat = (0, import_react.useMemo)(() => new ShaderMaterial({
		transparent: true,
		depthWrite: false,
		uniforms: { uTime: { value: 0 } },
		vertexShader: cloudVert,
		fragmentShader: cloudFrag
	}), []);
	(0, import_react.useEffect)(() => () => mat.dispose(), [mat]);
	useFrame((_, raw) => {
		const delta = Math.min(raw, .1);
		mat.uniforms.uTime.value += delta;
		if (ref.current) ref.current.rotation.y += delta * .012;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		ref,
		scale: 1.02,
		renderOrder: 2,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
			1,
			64,
			48
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("primitive", {
			object: mat,
			attach: "material"
		})]
	});
}
var atmosVert = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
var atmosFrag = `
  varying vec3 vNormal;
  void main() {
    float fres = 0.78 - dot(normalize(vNormal), vec3(0.0, 0.0, 1.0));
    fres = pow(clamp(fres, 0.0, 1.0), 2.15);
    gl_FragColor = vec4(0.84, 0.90, 0.96, fres * 1.05);
  }
`;
function Atmosphere() {
	const mat = (0, import_react.useMemo)(() => new ShaderMaterial({
		transparent: true,
		depthWrite: false,
		side: 1,
		blending: 2,
		vertexShader: atmosVert,
		fragmentShader: atmosFrag
	}), []);
	(0, import_react.useEffect)(() => () => mat.dispose(), [mat]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		scale: 1.16,
		renderOrder: 3,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
			1,
			64,
			48
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("primitive", {
			object: mat,
			attach: "material"
		})]
	});
}
function Stars() {
	const ref = (0, import_react.useRef)(null);
	const geo = (0, import_react.useMemo)(() => {
		const count = 420;
		const pos = new Float32Array(count * 3);
		const col = new Float32Array(count * 3);
		const v = new Vector3();
		for (let i = 0; i < count; i += 1) {
			v.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).normalize().multiplyScalar(12 + Math.random() * 8);
			pos[i * 3] = v.x;
			pos[i * 3 + 1] = v.y;
			pos[i * 3 + 2] = v.z;
			const g = .45 + Math.random() * .55;
			col[i * 3] = g;
			col[i * 3 + 1] = g;
			col[i * 3 + 2] = Math.min(1, g + .04);
		}
		const geometry = new BufferGeometry();
		geometry.setAttribute("position", new BufferAttribute(pos, 3));
		geometry.setAttribute("color", new BufferAttribute(col, 3));
		return geometry;
	}, []);
	(0, import_react.useEffect)(() => () => geo.dispose(), [geo]);
	useFrame((_, raw) => {
		if (ref.current) ref.current.rotation.y += Math.min(raw, .1) * .004;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("points", {
		ref,
		geometry: geo,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pointsMaterial", {
			size: .03,
			vertexColors: true,
			transparent: true,
			opacity: .7,
			depthWrite: false,
			sizeAttenuation: true
		})
	});
}
function Marker({ place, selected, onChoose }) {
	const frame = (0, import_react.useMemo)(() => {
		const pos = latLonToVector(place.lat, place.lon, 1.002);
		return {
			pos,
			q: new Quaternion().setFromUnitVectors(UP, pos.clone().normalize())
		};
	}, [place.lat, place.lon]);
	const bulb = (0, import_react.useRef)(null);
	const halo = (0, import_react.useRef)(null);
	const elapsed = (0, import_react.useRef)(place.lat);
	const gl = useThree((s) => s.gl);
	useFrame((_, raw) => {
		elapsed.current += Math.min(raw, .1);
		const pulse = 1 + Math.sin(elapsed.current * (selected ? 2.6 : 1.6)) * (selected ? .07 : .035);
		bulb.current?.scale.setScalar(pulse);
		halo.current?.scale.setScalar(selected ? 1.15 + pulse * .15 : .92);
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
		position: frame.pos,
		quaternion: frame.q,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					.046,
					0
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
					.0034,
					.0034,
					.092,
					6
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", { color: STEM })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				ref: bulb,
				position: [
					0,
					.1,
					0
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
					selected ? .026 : .018,
					18,
					18
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
					color: LAMP,
					emissive: LAMP,
					emissiveIntensity: selected ? 2.4 : 1.15,
					roughness: .35,
					metalness: 0
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				ref: halo,
				position: [
					0,
					.1,
					0
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
					.07,
					18,
					18
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
					color: LAMP,
					transparent: true,
					opacity: selected ? .55 : .28,
					depthWrite: false,
					blending: 2
				})]
			}),
			selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pointLight", {
				position: [
					0,
					.12,
					0
				],
				color: LAMP,
				intensity: 14,
				distance: 2.4,
				decay: 2
			}) : null,
			selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Html, {
				position: [
					0,
					.2,
					0
				],
				center: true,
				distanceFactor: 3.1,
				zIndexRange: [8, 0],
				style: { pointerEvents: "none" },
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "pin-label",
					children: place.name
				})
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					.1,
					0
				],
				onClick: (event) => {
					event.stopPropagation();
					onChoose(place.id);
				},
				onPointerOver: (event) => {
					event.stopPropagation();
					gl.domElement.style.cursor = "pointer";
				},
				onPointerOut: () => {
					gl.domElement.style.cursor = "";
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
					.09,
					10,
					10
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
					transparent: true,
					opacity: 0,
					depthWrite: false
				})]
			})
		]
	});
}
function CameraRig({ focus, reduced, onFlyChange }) {
	const camera = useThree((s) => s.camera);
	const controls = useThree((s) => s.controls);
	const job = (0, import_react.useRef)(null);
	const onFly = (0, import_react.useRef)(onFlyChange);
	onFly.current = onFlyChange;
	(0, import_react.useEffect)(() => {
		if (!focus) return;
		const place = findPlace(focus.id);
		if (!place) return;
		const radius = Math.max(camera.position.length(), 1.9);
		const flying = job.current !== null;
		job.current = {
			t: 0,
			dur: reduced ? .01 : 1.7,
			from: camera.position.clone().normalize(),
			to: latLonToVector(place.lat, place.lon, 1).normalize(),
			fromR: radius,
			toR: 2.62
		};
		if (!flying) onFly.current(true);
	}, [
		camera,
		focus,
		reduced
	]);
	useFrame((_, raw) => {
		const current = job.current;
		if (!current) {
			if (controls && !controls.enabled) controls.enabled = true;
			return;
		}
		if (controls) controls.enabled = false;
		const delta = Math.min(raw, .1);
		current.t = Math.min(1, current.t + delta / current.dur);
		const k = smooth(current.t);
		slerpDir(_dir, current.from, current.to, k);
		camera.position.copy(_dir).multiplyScalar(current.fromR + (current.toR - current.fromR) * k);
		camera.lookAt(0, 0, 0);
		if (controls) controls.target.set(0, 0, 0);
		if (current.t >= 1) {
			job.current = null;
			if (controls) controls.enabled = true;
			onFly.current(false);
		}
	});
	return null;
}
function Scene({ focus, spinning, reduced, onChoose, onDragChange, onFlyChange }) {
	const selected = focus?.id ?? null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("color", {
			attach: "background",
			args: [SKY]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ambientLight", {
			intensity: .42,
			color: "#d5dee6"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("hemisphereLight", {
			color: "#f4f7fa",
			groundColor: "#243240",
			intensity: .72
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("directionalLight", {
			position: [
				5.2,
				2.4,
				3.1
			],
			intensity: 2.05,
			color: "#fff8f1"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("directionalLight", {
			position: [
				-4.2,
				-1.1,
				-2.4
			],
			intensity: .38,
			color: "#b7c6d4"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stars, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Suspense, {
			fallback: null,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Earth, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Graticule, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clouds, {})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Atmosphere, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", { children: places.map((place) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Marker, {
			place,
			selected: place.id === selected,
			onChoose
		}, place.id)) }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrbitControls, {
			makeDefault: true,
			enablePan: false,
			enableDamping: true,
			dampingFactor: .08,
			rotateSpeed: .5,
			autoRotate: spinning,
			autoRotateSpeed: .42,
			minDistance: 1.85,
			maxDistance: 5.4,
			minPolarAngle: .22,
			maxPolarAngle: Math.PI - .22,
			onStart: () => onDragChange(true),
			onEnd: () => onDragChange(false)
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CameraRig, {
			focus,
			reduced,
			onFlyChange
		})
	] });
}
function GlobeView(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Canvas, {
		camera: {
			position: [
				.95,
				.7,
				2.75
			],
			fov: 42,
			near: .1,
			far: 40
		},
		dpr: [1, 1.75],
		gl: {
			antialias: true,
			alpha: false,
			powerPreference: "high-performance",
			preserveDrawingBuffer: true
		},
		onCreated: ({ gl, camera }) => {
			gl.setClearColor(new Color(SKY));
			gl.toneMappingExposure = 1.12;
			camera.lookAt(0, 0, 0);
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scene, { ...props })
	});
}
//#endregion
export { GlobeView };
