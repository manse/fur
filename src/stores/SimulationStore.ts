import { action, computed, observable } from 'mobx';
import { EdgeStore } from './EdgeStore';
import { FragmentStore } from './FragmentStore';
import { VertexStore } from './VertexStore';

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

  private constructor(public vertexStore: VertexStore, radius: number, angle: number) {
    this.radius = radius;
    this.angle = angle;
  }

  public rotate(delta: number) {
    this.angle += delta;
  }

  @computed
  public get coordinate() {
    return {
      x: Math.cos(this.angle) * this.radius,
      y: Math.sin(this.angle) * this.radius,
    };
  }

  public static fromPoints(vertexStore: VertexStore, fromX: number, fromY: number, toX: number, toY: number) {
    return new VectorStore(vertexStore, Math.atan2(toY - fromY, toX - fromX), length(fromX, fromY, toX, toY));
  }
}

type Relation = [VectorStore, VectorStore];

class PlateStore {
  @observable
  public x = 0;
  @observable
  public y = 0;

  private vectors: VectorStore[];
  private edgeStores: EdgeStore[];

  private constructor(public v0: VectorStore, public v1: VectorStore, public v2: VectorStore) {
    this.vectors = [v0, v1, v2];
    this.edgeStores = [
      new EdgeStore(v0.vertexStore, v1.vertexStore),
      new EdgeStore(v1.vertexStore, v2.vertexStore),
      new EdgeStore(v2.vertexStore, v0.vertexStore),
    ];
  }

  @action
  public translate(dx: number, dy: number) {
    this.x += dx;
    this.y += dy;
  }

  @action
  public rotate(delta: number) {
    this.vectors.forEach(vector => vector.rotate(delta));
  }

  @computed
  public get coordinates() {
    return this.vectors.map(v => {
      const { x, y } = v.coordinate;
      return {
        x: x + this.x,
        y: y + this.y,
      };
    });
  }

  public findVectors(edgeStore: EdgeStore): Relation | null {
    const found = this.edgeStores.find(edge => edge.equals(edgeStore));
    if (!found) return null;
    const relation: Relation = [
      this.vectors.find(v => v.vertexStore === found.v0),
      this.vectors.find(v => v.vertexStore === found.v1),
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

  private relations: Relation[] = [];

  constructor(private fragmentStores: FragmentStore[], private edgeStores: EdgeStore[]) {}

  @action
  public simulate() {
    const connectedEdgeStores = this.collectConnectedEdgeStores();
    this.plateStores = this.fragmentStores
      .filter(fragment => connectedEdgeStores.some(relation => fragment.containsEdge(relation)))
      .map(fragment => PlateStore.fromFragmentStore(fragment));
    this.relations = connectedEdgeStores.reduce((acc, edgeStore) => {
      const relations = this.plateStores.map(plate => plate.findVectors(edgeStore)).filter(id => !!id);
      if (relations.length) {
        if (relations.length !== 2) throw new Error('Invalid form of fragments');
        const [[a, b], [x, y]] = relations;
        if (a.vertexStore === x.vertexStore && b.vertexStore === y.vertexStore) return [...acc, [a, x], [b, y]];
        if (a.vertexStore === y.vertexStore && b.vertexStore === x.vertexStore) return [...acc, [a, y], [b, x]];
        throw new Error('Pairs not matched');
      }
      return [...acc];
    }, []);
    this.generateTranslationPatches().forEach(patch => patch());
    this.generateRotationPatches().forEach(patch => patch());
  }

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

  private generateTranslationPatches(): Function[] {
    return [];
  }

  private generateRotationPatches(): Function[] {
    return [];
  }
}
