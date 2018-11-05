import { action, computed, observable } from 'mobx';
import { EdgeStore } from './EdgeStore';
import { FragmentStore } from './FragmentStore';
import { VertexStore } from './VertexStore';

enum Phase {
  plate,
  wire,
}

const M_PI2 = Math.PI * 2;

function noop() {}

function rad2deg(rad: number) {
  return Math.floor((rad * 180) / Math.PI);
}

function pow2(n: number) {
  return n * n;
}

function length(x0: number, y0: number, x1: number, y1: number) {
  const dx = x0 - x1;
  const dy = y0 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

function calcCirclesIntersection(x1: number, y1: number, r1: number, x2: number, y2: number, r2: number) {
  const l = Math.sqrt(pow2(x2 - x1) + pow2(y2 - y1));
  const theta1 = Math.atan2(y2 - y1, x2 - x1);
  const theta2 = Math.acos((pow2(l) + pow2(r1) - pow2(r2)) / (2 * l * r1));
  if (isNaN(theta1) || isNaN(theta2)) throw new Error('Invalid geometry');
  const x = x1 + r1 * Math.cos(theta1 - theta2);
  const y = y1 + r1 * Math.sin(theta1 - theta2);
  return [x, y];
}

class VectorStore {
  @observable
  public radius: number;
  @observable
  public angle: number;
  @observable
  public offsetX: number = 0;
  @observable
  public offsetY: number = 0;

  private constructor(public vertexStore: VertexStore, radius: number, angle: number) {
    this.radius = radius;
    this.angle = angle;
  }

  @action
  public translate(dx: number, dy: number) {
    this.offsetX += dx;
    this.offsetY += dy;
  }

  @action
  public rotate(delta: number) {
    this.angle += delta;
  }

  @computed
  public get localCoordinate() {
    return {
      x: Math.cos(this.angle) * this.radius,
      y: Math.sin(this.angle) * this.radius,
    };
  }

  @computed
  public get globalCoordinate() {
    const { x, y } = this.localCoordinate;
    return {
      x: this.offsetX + x,
      y: this.offsetY + y,
    };
  }

  public static fromPoints(vertexStore: VertexStore, fromX: number, fromY: number, toX: number, toY: number) {
    return new VectorStore(vertexStore, length(fromX, fromY, toX, toY), Math.atan2(toY - fromY, toX - fromX));
  }
}

class WireStore {
  constructor(public plateStore: PlateStore, public v0: VectorStore, public v1: VectorStore) {}

  private zipPairWire(wire: WireStore) {
    const a = this.v0;
    const b = this.v1;
    const c = wire.v0;
    const d = wire.v1;
    if (a.vertexStore === c.vertexStore && b.vertexStore === d.vertexStore) {
      return [[a, b], [c, d]];
    }
    if (a.vertexStore === d.vertexStore && b.vertexStore === c.vertexStore) {
      return [[a, b], [d, c]];
    }
    throw new Error('Invalid pair vectors');
  }

  public calcRotationDelta(wire: WireStore) {
    const [[start0, end0], [start1, end1]] = this.zipPairWire(wire);
    const startCoord0 = start0.globalCoordinate;
    const endCoord0 = end0.globalCoordinate;
    const startCoord1 = start1.globalCoordinate;
    const endCoord1 = end1.globalCoordinate;
    const selfAngle = Math.atan2(endCoord0.y - startCoord0.y, endCoord0.x - startCoord0.x) + Math.random() * 0.1;
    const targetAngle = Math.atan2(endCoord1.y - startCoord1.y, endCoord1.x - startCoord1.x) + Math.random() * 0.1;
    let rotation = (targetAngle - selfAngle + M_PI2) % M_PI2;
    if (rotation > Math.PI) rotation -= M_PI2;
    // console.log(rad2deg(selfAngle - targetAngle), rad2deg(rotation), rad2deg(selfAngle), rad2deg(targetAngle));
    return rotation * 0.3 * Math.random();
  }

  public calcTranslationDelta(wire: WireStore): [number, number] {
    const [[start0, end0], [start1, end1]] = this.zipPairWire(wire);
    const startCoord0 = start0.globalCoordinate;
    const endCoord0 = end0.globalCoordinate;
    const startCoord1 = start1.globalCoordinate;
    const endCoord1 = end1.globalCoordinate;
    const selfX = (startCoord0.x + endCoord0.x) / 2;
    const selfY = (startCoord0.y + endCoord0.y) / 2;
    const targetX = (startCoord1.x + endCoord1.x) / 2;
    const targetY = (startCoord1.y + endCoord1.y) / 2;
    return [(targetX - selfX) * 0.3, (targetY - selfY) * 0.3];
  }

  public equals(wire: WireStore) {
    const a = wire.v0.vertexStore;
    const b = wire.v1.vertexStore;
    const x = this.v0.vertexStore;
    const y = this.v1.vertexStore;
    return (a === x && b === y) || (a === y && b === x);
  }

  public equalsToEdge(edge: EdgeStore) {
    const a = edge.v0;
    const b = edge.v1;
    const x = this.v0.vertexStore;
    const y = this.v1.vertexStore;
    return (a === x && b === y) || (a === y && b === x);
  }
}

class PlateStore {
  public id = Math.floor(Math.random() * 1e8).toString(36);
  public vectorStores: VectorStore[];
  public wireStores: WireStore[];

  private constructor(public v0: VectorStore, public v1: VectorStore, public v2: VectorStore) {
    this.vectorStores = [v0, v1, v2];
    this.wireStores = [new WireStore(this, v0, v1), new WireStore(this, v1, v2), new WireStore(this, v2, v0)];
  }

  @action
  public translate(dx: number, dy: number) {
    this.vectorStores.forEach(vector => vector.translate(dx, dy));
  }

  @action
  public rotate(delta: number) {
    this.vectorStores.forEach(vector => vector.rotate(delta));
  }

  @computed
  public get globalCoordinates() {
    return this.vectorStores.map(vector => vector.globalCoordinate);
  }

  public findWireByEdge(edgeStore: EdgeStore) {
    return this.wireStores.find(wire => wire.equalsToEdge(edgeStore));
  }

  public static fromFragmentStore({ v0, v1, v2 }: FragmentStore) {
    const x0 = 0;
    const y0 = 0;
    const x1 = v0.length(v1);
    const y1 = 0;
    const [x2, y2] = calcCirclesIntersection(x0, y0, v0.length(v2), x1, y1, v1.length(v2));
    const centerX = (x0 + x1 + x2) / 3;
    const centerY = (y0 + y1 + y2) / 3;
    return new PlateStore(
      VectorStore.fromPoints(v0, centerX, centerY, x0, y0),
      VectorStore.fromPoints(v1, centerX, centerY, x1, y1),
      VectorStore.fromPoints(v2, centerX, centerY, x2, y2),
    );
  }
}

export class SimulationStore {
  @observable
  public plateStores: PlateStore[] = [];
  @observable
  public autorun = false;
  @observable
  public phase = Phase.plate;

  private relations: [WireStore, WireStore][] = [];

  constructor(private fragmentStores: FragmentStore[], private edgeStores: EdgeStore[]) {}

  @action
  public reset() {
    console.log('reset');
    const connectedEdgeStores = this.collectConnectedEdgeStores();
    this.plateStores = this.fragmentStores
      .filter(fragment => connectedEdgeStores.some(relation => fragment.containsEdge(relation)))
      .map(fragment => PlateStore.fromFragmentStore(fragment));
    this.plateStores.forEach(plate => {
      plate.rotate(Math.random() * M_PI2);
      plate.translate((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10);
    });
    this.relations = [];
    connectedEdgeStores.forEach(edgeStore => {
      const relations = this.plateStores.map(plate => plate.findWireByEdge(edgeStore)).filter(id => !!id);
      if (!relations.length) return;
      if (relations.length !== 2) throw new Error('Invalid form of fragments');
      const [a, b] = relations;
      if (this.relations.some(([x, y]) => (x.equals(a) && y.equals(b)) || (x.equals(b) && y.equals(a)))) {
        return undefined;
      }
      this.relations.push([a, b]);
    });
    this.phase = Phase.plate;
  }

  @action
  public iterate() {
    switch (this.phase) {
      case Phase.plate:
        this.iteratePlate();
        break;
      case Phase.wire:
        this.iterateWire();
        break;
    }
  }

  private iteratePlate() {
    this.relations.map(relation => {
      const translation0 = relation[0].calcTranslationDelta(relation[1]);
      const translation1 = relation[1].calcTranslationDelta(relation[0]);
      relation[0].plateStore.translate(...translation0);
      relation[1].plateStore.translate(...translation1);
    });
    this.relations.map(relation => {
      const rotation0 = relation[0].calcRotationDelta(relation[1]);
      const rotation1 = relation[1].calcRotationDelta(relation[0]);
      relation[0].plateStore.rotate(rotation0);
      relation[1].plateStore.rotate(rotation1);
    });
  }

  private iterateWire() {}

  private collectConnectedEdgeStores(): EdgeStore[] {
    const startFragment = this.fragmentStores[0];
    if (!startFragment) return [];

    const relations: EdgeStore[] = [];
    const walk = (fragmentStore: FragmentStore) => {
      fragmentStore.edgeStores
        // ignore darts
        .filter(edge => !this.edgeStores.some(e => e.equals(edge)))
        .forEach(edge => {
          this.fragmentStores
            .filter(fragment => fragment.containsEdge(edge) && fragment !== fragmentStore)
            .forEach(fragment => {
              if (relations.some(relation => relation.equals(edge))) return;
              relations.push(edge);
              walk(fragment);
            });
        });
    };
    walk(startFragment);
    return relations;
  }
}
