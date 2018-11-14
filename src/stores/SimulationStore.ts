import { action, observable } from 'mobx';
import { times } from 'ramda';
import * as THREE from 'three';
import { EdgeStore } from './EdgeStore';
import { FragmentStore } from './FragmentStore';
import { VertexStore } from './VertexStore';

function noop() {}

class Constraint {
  constructor(public a0: Anchor, public a1: Anchor, private distance: number, private factor: number) {}

  public apply() {
    const diff = new THREE.Vector3(
      this.a0.vector.x - this.a1.vector.x,
      this.a0.vector.y - this.a1.vector.y,
      this.a0.vector.z - this.a1.vector.z,
    );
    const r = diff.length();
    const delta = this.distance - r;
    this.a0.vector.add(diff.multiplyScalar(delta * this.factor));
    this.a1.vector.add(diff.multiplyScalar(-1));
  }

  public equals(a0: Anchor, a1: Anchor) {
    return (a0 === this.a0 && a1 === this.a1) || (a0 === this.a1 && a1 === this.a0);
  }
}

class Anchor {
  public readonly id = Math.floor(Math.random() * 1e12).toString(36);
  public vector: THREE.Vector3;

  constructor(public vertexStore: VertexStore) {
    this.vector = new THREE.Vector3(vertexStore.position.x, vertexStore.position.y, vertexStore.position.z);
  }
}

class Plate {
  public readonly id = Math.floor(Math.random() * 1e12).toString(36);
  @observable
  public key = Math.random();
  public parentPlates: Plate[] = [];
  public anchors: Anchor[];
  public geometry: THREE.Geometry;
  public face: THREE.Face3;

  constructor(public fragmentStore: FragmentStore, public a0: Anchor, public a1: Anchor, public a2: Anchor) {
    this.anchors = [a0, a1, a2];
    this.geometry = new THREE.Geometry();
    this.geometry.vertices.push(a0.vector);
    this.geometry.vertices.push(a1.vector);
    this.geometry.vertices.push(a2.vector);
    this.face = new THREE.Face3(0, 1, 2);
    this.geometry.faces.push(this.face);
    this.updateNormals();
  }

  public getCenter() {
    return new THREE.Vector3()
      .copy(this.a0.vector)
      .add(this.a1.vector)
      .add(this.a2.vector)
      .multiplyScalar(1 / 3);
  }

  public updateNormals() {
    this.geometry.computeFaceNormals();
    this.geometry.computeVertexNormals();
  }

  public generateRotationPatch() {
    if (!this.parentPlates.length) return noop;
    const targetVector = this.parentPlates
      .reduce((acc, parent) => new THREE.Vector3().addVectors(acc, parent.face.normal), new THREE.Vector3(0, 0, 0))
      .multiplyScalar(1 / this.parentPlates.length)
      .normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(this.face.normal, targetVector);
    const center = this.getCenter();
    const mat = new THREE.Matrix4()
      .copy(new THREE.Matrix4().makeTranslation(center.x, center.y, center.z))
      .multiply(new THREE.Matrix4().makeRotationFromQuaternion(q))
      .multiply(new THREE.Matrix4().makeTranslation(-center.x, -center.y, -center.z));
    return () => this.geometry.applyMatrix(mat);
  }

  public findAnchorPairs(plate: Plate): [[Anchor, Anchor], [Anchor, Anchor]] {
    const results = this.anchors
      .map(anchor => {
        const pair = plate.anchors.find(a => a.vertexStore === anchor.vertexStore);
        return pair && [anchor, pair];
      })
      .filter(id => id);
    if (results.length !== 2) throw 0;
    return results as any;
  }

  public getRestAnchor(a0: Anchor, a1: Anchor) {
    return this.anchors.find(a => a.vertexStore !== a0.vertexStore && a.vertexStore !== a1.vertexStore);
  }

  @action
  public invalidate() {
    this.key = Math.random();
  }
}

export class SimulationStore {
  @observable
  public plates: Plate[] = [];
  @observable
  public key = Math.random();
  private constraints: Constraint[];

  constructor(private fragmentStores: FragmentStore[], private edgeStores: EdgeStore[]) {}

  @action
  public reset() {
    if (!this.fragmentStores.length) return;
    this.plates = this.fragmentStores.map(
      fragment => new Plate(fragment, new Anchor(fragment.v0), new Anchor(fragment.v1), new Anchor(fragment.v2)),
    );
    this.constraints = [];
    this.buildEdgeLengthConstraint();
    this.buildVerticesDistanceConstraint();
    this.buildPlateRelation();
    this.resetAttitude();
  }

  @action
  public iterate() {
    if (!this.fragmentStores.length) return;
    this.resetAttitude();
    this.plates.forEach(plate => plate.updateNormals());
    this.plates.map(plate => plate.generateRotationPatch()).forEach(fn => fn());
    times(() => this.constraints.forEach(constraint => constraint.apply()), 50);
    this.invalidate();
  }

  public getBounding() {
    const minPoints = this.plates.map(p => ({
      x: Math.min(p.a0.vector.x, p.a1.vector.x, p.a2.vector.x),
      y: Math.min(p.a0.vector.y, p.a1.vector.y, p.a2.vector.y),
      z: Math.min(p.a0.vector.z, p.a1.vector.z, p.a2.vector.z),
    }));
    const maxPoints = this.plates.map(p => ({
      x: Math.max(p.a0.vector.x, p.a1.vector.x, p.a2.vector.x),
      y: Math.max(p.a0.vector.y, p.a1.vector.y, p.a2.vector.y),
      z: Math.max(p.a0.vector.z, p.a1.vector.z, p.a2.vector.z),
    }));
    return {
      min: {
        x: Math.min(...minPoints.map(({ x }) => x)),
        y: Math.min(...minPoints.map(({ y }) => y)),
        z: Math.min(...minPoints.map(({ z }) => z)),
      },
      max: {
        x: Math.max(...maxPoints.map(({ x }) => x)),
        y: Math.max(...maxPoints.map(({ y }) => y)),
        z: Math.max(...maxPoints.map(({ z }) => z)),
      },
    };
  }

  @action
  public invalidate() {
    this.key = Math.random();
    this.plates.forEach(plate => plate.invalidate());
  }

  private getRootFragment() {
    return this.fragmentStores[0];
  }

  private getPlate(fragment: FragmentStore) {
    return this.plates.find(plate => plate.fragmentStore === fragment);
  }

  private constraintExistsBetween(a0: Anchor, a1: Anchor) {
    const result = this.constraints.some(constraint => constraint.equals(a0, a1));
    return result;
  }

  private buildEdgeLengthConstraint() {
    this.plates.forEach(({ a0, a1, a2 }) => {
      this.constraints.push(
        new Constraint(a0, a1, a0.vertexStore.length(a1.vertexStore), 0.01),
        new Constraint(a1, a2, a1.vertexStore.length(a2.vertexStore), 0.01),
        new Constraint(a2, a0, a2.vertexStore.length(a0.vertexStore), 0.01),
      );
    });
  }

  private buildVerticesDistanceConstraint() {
    const rootFragment = this.getRootFragment();
    const visited = [rootFragment];
    const dig = (fromFragment: FragmentStore) => {
      fromFragment.edgeStores.filter(edge => !this.edgeStores.some(e => edge.equals(e))).forEach(searchEdge => {
        const toFragment = this.fragmentStores.find(
          fragment => fragment !== fromFragment && fragment.edgeStores.some(edge => edge.equals(searchEdge)),
        );
        if (!toFragment) return;
        const fromPlate = this.plates.find(plate => plate.fragmentStore === fromFragment);
        const toPlate = this.plates.find(plate => plate.fragmentStore === toFragment);
        const pairs = fromPlate.findAnchorPairs(toPlate);
        pairs
          .filter(([a, b]) => !this.constraintExistsBetween(a, b))
          .forEach(([a, b]) => this.constraints.push(new Constraint(a, b, 0, 0.33)));
        const ra0 = fromPlate.getRestAnchor(pairs[0][0], pairs[1][0]);
        const ra1 = toPlate.getRestAnchor(pairs[0][0], pairs[1][0]);
        this.constraints.push(new Constraint(ra0, ra1, ra0.vertexStore.length(ra1.vertexStore), 0.01));
        if (visited.includes(toFragment)) return;
        visited.push(toFragment);
        dig(toFragment);
      });
    };
    dig(rootFragment);
  }

  private buildPlateRelation() {
    const expand = () => {
      const next: FragmentStore[] = [];
      lasts.forEach(parent => {
        const parentPlate = this.getPlate(parent);
        this.fragmentStores
          .filter(fragment => !visited.includes(fragment))
          .filter(fragment => fragment.edgeStores.some(edge => parent.containsEdge(edge)))
          .forEach(child => {
            this.getPlate(child).parentPlates.push(parentPlate);
            if (next.includes(child)) return;
            next.push(child);
          });
      });
      visited.push(...next);
      return next;
    };
    const rootFragment = this.getRootFragment();
    const visited = [rootFragment];
    let lasts = [rootFragment];
    while ((lasts = expand()).length) {}
  }

  private resetAttitude() {
    const initialPlate = this.getPlate(this.getRootFragment());
    const q = new THREE.Quaternion().setFromUnitVectors(initialPlate.face.normal, new THREE.Vector3(0, 0, -1));
    const mat = new THREE.Matrix4().makeRotationFromQuaternion(q);
    this.plates.forEach(p => p.geometry.applyMatrix(mat));
  }
}
