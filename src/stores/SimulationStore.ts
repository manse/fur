import { action, computed, observable } from 'mobx';
import { EdgeStore } from './EdgeStore';
import { FragmentStore } from './FragmentStore';
import { VertexStore } from './VertexStore';

enum Phase {
  plate,
  wire,
}

function noop() {}

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

  public relations: VectorStore[] = [];

  private constructor(public vertexStore: VertexStore, radius: number, angle: number) {
    this.radius = radius;
    this.angle = angle;
  }

  public translate(dx: number, dy: number) {
    this.offsetX = dx;
    this.offsetY = dy;
  }

  public rotate(delta: number) {
    this.angle += delta;
  }

  public addRelation(relation: VectorStore) {
    this.relations.push(relation);
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
    return new VectorStore(vertexStore, Math.atan2(toY - fromY, toX - fromX), length(fromX, fromY, toX, toY));
  }
}

class PlateStore {
  public vectorStores: VectorStore[];
  public edgeStores: EdgeStore[];

  private constructor(public v0: VectorStore, public v1: VectorStore, public v2: VectorStore) {
    this.vectorStores = [v0, v1, v2];
    this.edgeStores = [
      new EdgeStore(v0.vertexStore, v1.vertexStore),
      new EdgeStore(v1.vertexStore, v2.vertexStore),
      new EdgeStore(v2.vertexStore, v0.vertexStore),
    ];
  }

  @action
  public translate(dx: number, dy: number) {
    this.vectorStores.forEach(vector => vector.translate(dx, dy));
  }

  @action
  public rotate(delta: number) {
    this.vectorStores.forEach(vector => vector.rotate(delta));
  }

  public findVectors(edgeStore: EdgeStore) {
    const found = this.edgeStores.find(edge => edge.equals(edgeStore));
    if (!found) return null;
    const relation: [VectorStore, VectorStore] = [
      this.vectorStores.find(v => v.vertexStore === found.v0),
      this.vectorStores.find(v => v.vertexStore === found.v1),
    ];
    if (!relation[0] || !relation[1]) throw new Error('Not matched');
    return relation;
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

  constructor(private fragmentStores: FragmentStore[], private edgeStores: EdgeStore[]) {}

  @action
  public reset() {
    const connectedEdgeStores = this.collectConnectedEdgeStores();
    this.plateStores = this.fragmentStores
      .filter(fragment => connectedEdgeStores.some(relation => fragment.containsEdge(relation)))
      .map(fragment => PlateStore.fromFragmentStore(fragment));
    connectedEdgeStores.forEach(edgeStore => {
      const relations = this.plateStores.map(plate => plate.findVectors(edgeStore)).filter(id => !!id);
      if (!relations.length) return;
      if (relations.length !== 2) throw new Error('Invalid form of fragments');
      const [[a, b], [c, d]] = relations;
      let x: VectorStore;
      let y: VectorStore;
      let z: VectorStore;
      let w: VectorStore;
      if (a.vertexStore === c.vertexStore && b.vertexStore === d.vertexStore) {
        [x, y, z, w] = [a, c, b, d];
      } else if (a.vertexStore === d.vertexStore && b.vertexStore === c.vertexStore) {
        [x, y, z, w] = [a, d, b, c];
      } else {
        throw new Error('Pairs not matched');
      }
      x.addRelation(y);
      y.addRelation(x);
      z.addRelation(w);
      w.addRelation(z);
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

  private iteratePlate(factor = 1) {
    // translate
    this.plateStores
      .map(plate => {
        let dx = 0;
        let dy = 0;
        let count = 0;
        plate.vectorStores.forEach(vector => {
          const vectorCoord = vector.globalCoordinate;
          vector.relations.forEach(relation => {
            const relationCoord = relation.globalCoordinate;
            dx += relationCoord.x - vectorCoord.x;
            dy += relationCoord.y - vectorCoord.y;
            count += 1;
          });
        });
        return count ? () => plate.translate((dx / count) * factor, (dy / count) * factor) : noop;
      })
      .forEach(fn => fn());
  }

  private iterateWire() {}

  private collectConnectedEdgeStores(): EdgeStore[] {
    const startFragment = this.fragmentStores[0];
    if (!startFragment) return [];

    const relations: EdgeStore[] = [];
    const walk = (fragmentStore: FragmentStore) => {
      fragmentStore.edgeStores.filter(edge => !this.edgeStores.some(e => e.equals(edge))).forEach(edge => {
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
