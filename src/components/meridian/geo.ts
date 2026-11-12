import { Vector3 } from "three";

const DEG = Math.PI / 180;

/** Matches three.js SphereGeometry: u = 0 at lon −180, v = 1 at the north pole. */
export function latLonToVector(lat: number, lon: number, radius: number, target = new Vector3()): Vector3 {
  const theta = (90 - lat) * DEG;
  const phi = (lon + 180) * DEG;
  const sinTheta = Math.sin(theta);
  return target.set(
    -radius * sinTheta * Math.cos(phi),
    radius * Math.cos(theta),
    radius * sinTheta * Math.sin(phi),
  );
}
