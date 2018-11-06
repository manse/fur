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

function calcCirclesIntersection(
  x0: number,
  y0: number,
  r0: number,
  x1: number,
  y1: number,
  r1: number,
  counterClockwise: boolean,
): [number, number] {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const d = Math.sqrt(dx * dx + dy * dy);
  if (d > r0 + r1) return null;
  if (d < Math.abs(r0 - r1)) return null;
  const a = (r0 * r0 - r1 * r1 + d * d) / (2 * d);
  const x2 = x0 + (dx * a) / d;
  const y2 = y0 + (dy * a) / d;
  const h = Math.sqrt(r0 * r0 - a * a);
  const rx = -dy * (h / d);
  const ry = dx * (h / d);
  return counterClockwise ? [x2 + rx, y2 + ry] : [x2 - rx, y2 - ry];
}

function calcCirclesIntersectionFallback(
  x0: number,
  y0: number,
  r0: number,
  x1: number,
  y1: number,
  r1: number,
  counterClockwise: boolean,
): [number, number] {
  const [u, v] = r0 > r1 ? [0.5, 1] : [1, 0.5];
  for (let i = 0, s = 1, t = 1; i < 100; i += 1, s += u, t += v) {
    const intersection = calcCirclesIntersection(x0, y0, r0 * s, x1, y1, r1 * t, counterClockwise);
    if (intersection) return intersection;
  }
  return [(x0 + x1) / 2, (y0 + y1) / 2];
}

class AnchorStore {
  @observable
  public x = 0;
  @observable
  public y = 0;

  constructor(public vertexStore: VertexStore, x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  @action
  public translate(dx: number, dy: number) {
    this.x += dx;
    this.y += dy;
  }
}

class SpringStore {
  public readonly id = Math.floor(Math.random() * 1e12).toString(36);
  public readonly eqLength: number;

  constructor(public a0: AnchorStore, public a1: AnchorStore) {
    this.eqLength = a0.vertexStore.length(a1.vertexStore);
  }

  @computed
  public get length() {
    return length(this.a0.x, this.a0.y, this.a1.x, this.a1.y);
  }

  public equalsToEdge(edge: EdgeStore) {
    return this.containsVertices(edge.v0, edge.v1);
  }

  public containsVertices(v0: VertexStore, v1: VertexStore) {
    return (
      (v0 === this.a0.vertexStore && v1 === this.a1.vertexStore) ||
      (v0 === this.a1.vertexStore && v1 === this.a0.vertexStore)
    );
  }

  public findAnchorByVertex(v: VertexStore): AnchorStore {
    if (v === this.a0.vertexStore) return this.a0;
    if (v === this.a1.vertexStore) return this.a1;
    return undefined;
  }
}

export class SimulationStore {
  @observable
  public springStores: SpringStore[] = [];

  constructor(private fragmentStores: FragmentStore[], private edgeStores: EdgeStore[]) {}

  @action
  public reset() {
    if (!this.fragmentStores.length) return;
    const startFragment = this.findCenterFragment();
    this.springStores = [];
    console.log('======================');
    this.buildInitialSprings(startFragment);
    this.buildRestSprings(startFragment);
  }

  @action
  public iterate() {}

  private findCenterFragment() {
    // @TODO
    return this.fragmentStores[0];
  }

  private buildInitialSprings(startFragment: FragmentStore) {
    const { v0, v1, v2 } = startFragment;
    const length01 = v0.length(v1);
    const length12 = v1.length(v2);
    const length20 = v2.length(v0);
    const a0 = new AnchorStore(v0, 0, 0);
    const a1 = new AnchorStore(v1, length01, 0);
    const intersection = calcCirclesIntersectionFallback(0, 0, length20, length01, 0, length12, false);
    const a2 = new AnchorStore(v2, ...intersection);
    this.springStores.push(new SpringStore(a0, a1), new SpringStore(a1, a2), new SpringStore(a2, a0));
  }

  private buildRestSprings(startFragment: FragmentStore) {
    const visitedFragments: FragmentStore[] = [startFragment];
    const dig = (fragment: FragmentStore) => {
      fragment.edgeStores.forEach(edge => {
        this.fragmentStores.filter(f => !visitedFragments.includes(f)).forEach(f => {
          const sharedEdge = f.edgeStores.find(e => e.equals(edge));
          if (!sharedEdge || this.edgeStores.some(e => e.equals(sharedEdge))) return;
          visitedFragments.push(f);
          this.buildSpring(f, sharedEdge);
          this.updateSprings();
          this.updateSprings();
          dig(f);
        });
      });
    };
    dig(startFragment);
  }

  private buildSpring(fragment: FragmentStore, edge: EdgeStore) {
    const restVertices = fragment.vertexStores.filter(vertex => vertex !== edge.v0 && vertex !== edge.v1);
    if (restVertices.length !== 1) throw 0;
    const toVertex = restVertices[0];

    const fromSpring = this.springStores.find(spring => spring.equalsToEdge(edge));
    if (!fromSpring) throw 0;

    const isDart = [edge.v0, edge.v1].some(fromVertex =>
      this.edgeStores.some(edge => edge.containsVertices(toVertex, fromVertex)),
    );
    let toAnchor: AnchorStore;
    if (!isDart) {
      toAnchor = this.springStores.map(spring => spring.findAnchorByVertex(toVertex)).filter(id => !!id)[0];
    }
    if (!toAnchor) {
      const { a0, a1 } = fromSpring;
      const intersection = calcCirclesIntersectionFallback(
        a0.x,
        a0.y,
        a0.vertexStore.length(toVertex),
        a1.x,
        a1.y,
        a1.vertexStore.length(toVertex),
        !fragment.isClockwiseVertices(a0.vertexStore, a1.vertexStore),
      );
      toAnchor = new AnchorStore(toVertex, ...intersection);
    }
    this.springStores.push(new SpringStore(toAnchor, fromSpring.a0), new SpringStore(toAnchor, fromSpring.a1));
  }

  private updateSprings() {
    this.springStores
      .map(spring => {
        const { a0, a1 } = spring;
        const factor = (spring.eqLength - spring.length) * 0.1;
        return () => {
          a0.translate((a0.x - a1.x) * factor, (a0.y - a1.y) * factor);
          a1.translate((a1.x - a0.x) * factor, (a1.y - a0.y) * factor);
        };
      })
      .forEach(fn => fn());
  }
}
