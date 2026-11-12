import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls, useTexture } from "@react-three/drei";
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import {
  AdditiveBlending,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  MathUtils,
  NoColorSpace,
  Quaternion,
  ShaderMaterial,
  SRGBColorSpace,
  Vector3,
  type Mesh,
  type Points,
} from "three";
import { latLonToVector } from "@/components/meridian/geo";
import { findPlace, places, type Place } from "@/components/meridian/places";

export type Focus = { id: string; n: number };

export type GlobeViewProps = {
  focus: Focus | null;
  spinning: boolean;
  reduced: boolean;
  onChoose: (id: string) => void;
  onDragChange: (dragging: boolean) => void;
  onFlyChange: (flying: boolean) => void;
};

const LAMP = "#f7f3ea";
const STEM = "#d5d1c6";
const SKY = "#171d25";
const UP = new Vector3(0, 1, 0);
const ALT = new Vector3(1, 0, 0);
const _dir = new Vector3();
const _ortho = new Vector3();

type OrbitLike = {
  enabled: boolean;
  target: Vector3;
};

type Job = {
  t: number;
  dur: number;
  from: Vector3;
  to: Vector3;
  fromR: number;
  toR: number;
};

function smooth(t: number): number {
  const x = MathUtils.clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
}

function slerpDir(out: Vector3, a: Vector3, b: Vector3, t: number) {
  const dot = MathUtils.clamp(a.dot(b), -1, 1);
  if (dot > 0.9995) {
    out.copy(a).lerp(b, t).normalize();
    return;
  }
  if (dot < -0.9995) {
    _ortho.crossVectors(a, Math.abs(a.y) > 0.9 ? ALT : UP).normalize();
    out
      .copy(a)
      .lerp(b, t)
      .addScaledVector(_ortho, Math.sin(Math.PI * t) * 0.4)
      .normalize();
    return;
  }
  const theta = Math.acos(dot);
  const sinTheta = Math.sin(theta);
  const w1 = Math.sin((1 - t) * theta) / sinTheta;
  const w2 = Math.sin(t * theta) / sinTheta;
  out.copy(a).multiplyScalar(w1).addScaledVector(b, w2);
}

function useGraticule(): CanvasTexture {
  const tex = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(236, 234, 228, 0.55)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 12; i += 1) {
      const x = (i / 12) * canvas.width + 0.5;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let j = 0; j <= 6; j += 1) {
      const y = (j / 6) * canvas.height + 0.5;
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
  useEffect(() => () => tex.dispose(), [tex]);
  return tex;
}

function Earth() {
  const [colorMap, bumpMap] = useTexture(["/textures/earth.jpg", "/textures/earth-topology.png"]);
  useLayoutEffect(() => {
    colorMap.colorSpace = SRGBColorSpace;
    colorMap.anisotropy = 8;
    bumpMap.colorSpace = NoColorSpace;
  }, [bumpMap, colorMap]);

  return (
    <mesh>
      <sphereGeometry args={[1, 96, 64]} />
      <meshStandardMaterial
        map={colorMap}
        bumpMap={bumpMap}
        bumpScale={0.028}
        roughness={1}
        metalness={0}
        emissive="#f2f4f6"
        emissiveMap={colorMap}
        emissiveIntensity={0.55}
      />
    </mesh>
  );
}

function Graticule() {
  const map = useGraticule();
  return (
    <mesh scale={1.004} renderOrder={1}>
      <sphereGeometry args={[1, 64, 48]} />
      <meshBasicMaterial
        map={map}
        transparent
        opacity={0.1}
        depthWrite={false}
        polygonOffset
        polygonOffsetFactor={-2}
        polygonOffsetUnits={-2}
      />
    </mesh>
  );
}

const cloudVert = /* glsl */ `
  varying vec3 vPos;
  void main() {
    vPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const cloudFrag = /* glsl */ `
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
  const ref = useRef<Mesh>(null);
  const mat = useMemo(
    () =>
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: { uTime: { value: 0 } },
        vertexShader: cloudVert,
        fragmentShader: cloudFrag,
      }),
    [],
  );
  useEffect(() => () => mat.dispose(), [mat]);
  useFrame((_, raw) => {
    const delta = Math.min(raw, 0.1);
    mat.uniforms.uTime.value += delta;
    if (ref.current) ref.current.rotation.y += delta * 0.012;
  });
  return (
    <mesh ref={ref} scale={1.02} renderOrder={2}>
      <sphereGeometry args={[1, 64, 48]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

const atmosVert = /* glsl */ `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const atmosFrag = /* glsl */ `
  varying vec3 vNormal;
  void main() {
    float fres = 0.78 - dot(normalize(vNormal), vec3(0.0, 0.0, 1.0));
    fres = pow(clamp(fres, 0.0, 1.0), 2.15);
    gl_FragColor = vec4(0.84, 0.90, 0.96, fres * 1.05);
  }
`;

function Atmosphere() {
  const mat = useMemo(
    () =>
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: BackSide,
        blending: AdditiveBlending,
        vertexShader: atmosVert,
        fragmentShader: atmosFrag,
      }),
    [],
  );
  useEffect(() => () => mat.dispose(), [mat]);
  return (
    <mesh scale={1.16} renderOrder={3}>
      <sphereGeometry args={[1, 64, 48]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

function Stars() {
  const ref = useRef<Points>(null);
  const geo = useMemo(() => {
    const count = 420;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const v = new Vector3();
    for (let i = 0; i < count; i += 1) {
      v.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1)
        .normalize()
        .multiplyScalar(12 + Math.random() * 8);
      pos[i * 3] = v.x;
      pos[i * 3 + 1] = v.y;
      pos[i * 3 + 2] = v.z;
      const g = 0.45 + Math.random() * 0.55;
      col[i * 3] = g;
      col[i * 3 + 1] = g;
      col[i * 3 + 2] = Math.min(1, g + 0.04);
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(pos, 3));
    geometry.setAttribute("color", new BufferAttribute(col, 3));
    return geometry;
  }, []);
  useEffect(() => () => geo.dispose(), [geo]);
  useFrame((_, raw) => {
    if (ref.current) ref.current.rotation.y += Math.min(raw, 0.1) * 0.004;
  });
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial
        size={0.03}
        vertexColors
        transparent
        opacity={0.7}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

function Marker({
  place,
  selected,
  onChoose,
}: {
  place: Place;
  selected: boolean;
  onChoose: (id: string) => void;
}) {
  const frame = useMemo(() => {
    const pos = latLonToVector(place.lat, place.lon, 1.002);
    const q = new Quaternion().setFromUnitVectors(UP, pos.clone().normalize());
    return { pos, q };
  }, [place.lat, place.lon]);
  const bulb = useRef<Mesh>(null);
  const halo = useRef<Mesh>(null);
  const elapsed = useRef(place.lat);
  const gl = useThree((s) => s.gl);

  useFrame((_, raw) => {
    elapsed.current += Math.min(raw, 0.1);
    const pulse = 1 + Math.sin(elapsed.current * (selected ? 2.6 : 1.6)) * (selected ? 0.07 : 0.035);
    bulb.current?.scale.setScalar(pulse);
    halo.current?.scale.setScalar(selected ? 1.15 + pulse * 0.15 : 0.92);
  });

  return (
    <group position={frame.pos} quaternion={frame.q}>
      <mesh position={[0, 0.046, 0]}>
        <cylinderGeometry args={[0.0034, 0.0034, 0.092, 6]} />
        <meshBasicMaterial color={STEM} />
      </mesh>
      <mesh ref={bulb} position={[0, 0.1, 0]}>
        <sphereGeometry args={[selected ? 0.026 : 0.018, 18, 18]} />
        <meshStandardMaterial
          color={LAMP}
          emissive={LAMP}
          emissiveIntensity={selected ? 2.4 : 1.15}
          roughness={0.35}
          metalness={0}
        />
      </mesh>
      <mesh ref={halo} position={[0, 0.1, 0]}>
        <sphereGeometry args={[0.07, 18, 18]} />
        <meshBasicMaterial
          color={LAMP}
          transparent
          opacity={selected ? 0.55 : 0.28}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </mesh>
      {selected ? (
        <pointLight position={[0, 0.12, 0]} color={LAMP} intensity={14} distance={2.4} decay={2} />
      ) : null}
      {selected ? (
        <Html position={[0, 0.2, 0]} center distanceFactor={3.1} zIndexRange={[8, 0]} style={{ pointerEvents: "none" }}>
          <div className="pin-label">{place.name}</div>
        </Html>
      ) : null}
      <mesh
        position={[0, 0.1, 0]}
        onClick={(event) => {
          event.stopPropagation();
          onChoose(place.id);
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          gl.domElement.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          gl.domElement.style.cursor = "";
        }}
      >
        <sphereGeometry args={[0.09, 10, 10]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

function CameraRig({
  focus,
  reduced,
  onFlyChange,
}: {
  focus: Focus | null;
  reduced: boolean;
  onFlyChange: (flying: boolean) => void;
}) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as unknown as OrbitLike | null;
  const job = useRef<Job | null>(null);
  const onFly = useRef(onFlyChange);
  onFly.current = onFlyChange;

  useEffect(() => {
    if (!focus) return;
    const place = findPlace(focus.id);
    if (!place) return;
    const radius = Math.max(camera.position.length(), 1.9);
    const flying = job.current !== null;
    job.current = {
      t: 0,
      dur: reduced ? 0.01 : 1.7,
      from: camera.position.clone().normalize(),
      to: latLonToVector(place.lat, place.lon, 1).normalize(),
      fromR: radius,
      toR: 2.62,
    };
    if (!flying) onFly.current(true);
  }, [camera, focus, reduced]);

  useFrame((_, raw) => {
    const current = job.current;
    if (!current) {
      if (controls && !controls.enabled) controls.enabled = true;
      return;
    }
    if (controls) controls.enabled = false;
    const delta = Math.min(raw, 0.1);
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

function Scene({
  focus,
  spinning,
  reduced,
  onChoose,
  onDragChange,
  onFlyChange,
}: GlobeViewProps) {
  const selected = focus?.id ?? null;
  return (
    <>
      <color attach="background" args={[SKY]} />
      <ambientLight intensity={0.42} color="#d5dee6" />
      <hemisphereLight color="#f4f7fa" groundColor="#243240" intensity={0.72} />
      <directionalLight position={[5.2, 2.4, 3.1]} intensity={2.05} color="#fff8f1" />
      <directionalLight position={[-4.2, -1.1, -2.4]} intensity={0.38} color="#b7c6d4" />
      <Stars />
      <Suspense fallback={null}>
        <Earth />
        <Graticule />
        <Clouds />
      </Suspense>
      <Atmosphere />
      <group>
        {places.map((place) => (
          <Marker key={place.id} place={place} selected={place.id === selected} onChoose={onChoose} />
        ))}
      </group>
      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.5}
        autoRotate={spinning}
        autoRotateSpeed={0.42}
        minDistance={1.85}
        maxDistance={5.4}
        minPolarAngle={0.22}
        maxPolarAngle={Math.PI - 0.22}
        onStart={() => onDragChange(true)}
        onEnd={() => onDragChange(false)}
      />
      <CameraRig focus={focus} reduced={reduced} onFlyChange={onFlyChange} />
    </>
  );
}

export function GlobeView(props: GlobeViewProps) {
  return (
    <Canvas
      camera={{ position: [0.95, 0.7, 2.75], fov: 42, near: 0.1, far: 40 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance", preserveDrawingBuffer: true }}
      onCreated={({ gl, camera }) => {
        gl.setClearColor(new Color(SKY));
        gl.toneMappingExposure = 1.12;
        camera.lookAt(0, 0, 0);
      }}
    >
      <Scene {...props} />
    </Canvas>
  );
}
