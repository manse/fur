import { action, observable } from 'mobx';
import { EdgeStore } from './EdgeStore';
import { FragmentStore } from './FragmentStore';
import { VertexStore } from './VertexStore';

type FragmentRootNode = {
  fragmentStore: FragmentStore;
  children: FragmentLeafNode[];
};

type FragmentLeafNode = {
  fragmentStore: FragmentStore;
  parentEdgeStore: EdgeStore;
  children: FragmentLeafNode[];
};

function pow2(n: number) {
  return n * n;
}

function calcCirclesIntersectionFallback(
  x1: number,
  y1: number,
  r1: number,
  x2: number,
  y2: number,
  r2: number,
): { x: number; y: number } {
  let intersection: any;
  for (let i = 1; i < 10; i += 0.5) {
    intersection = calcCirclesIntersection(x1, y1, r1 * i, x2, y2, r2 * i);
    if (intersection) return intersection;
  }
  return {
    x: (x1 + x2) / 2,
    y: (y1 + y2) / 2,
  };
}

function calcCirclesIntersection(
  x1: number,
  y1: number,
  r1: number,
  x2: number,
  y2: number,
  r2: number,
): { x: number; y: number } | void {
  const l = Math.sqrt(pow2(x2 - x1) + pow2(y2 - y1));
  const theta1 = Math.atan2(y2 - y1, x2 - x1);
  const theta2 = Math.acos((pow2(l) + pow2(r1) - pow2(r2)) / (2 * l * r1));
  if (isNaN(theta1) || isNaN(theta2)) return;
  const x = x1 + r1 * Math.cos(theta1 - theta2);
  const y = y1 + r1 * Math.sin(theta1 - theta2);
  return { x, y };
}

class Anchor {
  constructor(public x: number, public y: number, public vertexStore: VertexStore) {}

  public move(dx: number, dy: number) {
    this.x += dx;
    this.y += dy;
  }
}

class Spring {
  public eqLength: number;

  constructor(public a0: Anchor, public a1: Anchor) {
    const dx = a0.vertexStore.position.x - a1.vertexStore.position.x;
    const dy = a0.vertexStore.position.y - a1.vertexStore.position.y;
    const dz = a0.vertexStore.position.z - a1.vertexStore.position.z;
    this.eqLength = Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
}

export class MeshStore {
  @observable
  public anchors: Anchor[] = [];
  @observable
  public springs: Spring[] = [];

  constructor(private fragmentStores: FragmentStore[], private edgeStores: EdgeStore[]) {}

  @action
  public simulate() {
    const startIndex = Math.floor(this.fragmentStores.length * Math.random());
    const root = this.buildFragmentTree(startIndex);
    if (!root) return;
    this.flatten(root);
  }

  private buildFragmentTree(startIndex: number): FragmentRootNode | void {
    const startFragment = this.fragmentStores[startIndex];
    if (!startFragment) return;

    const containFragments: FragmentStore[] = [startFragment];
    const dig = (fragmentStore: FragmentStore, parentEdgeStore?: EdgeStore) => {
      const children: FragmentLeafNode[] = [];
      this.fragmentStores.filter(fragment => containFragments.indexOf(fragment) === -1).forEach(fragment => {
        fragmentStore.edgeStores.filter(edge => !this.edgeStores.find(needle => needle.equals(edge))).forEach(edge => {
          fragment.edgeStores.forEach(fedge => {
            if (!edge.equals(fedge)) return;
            containFragments.push(fragment);
            children.push(dig(fragment, edge));
          });
        });
      });
      return {
        children,
        fragmentStore,
        parentEdgeStore,
      };
    };
    return dig(startFragment);
  }

  private flatten(root: FragmentRootNode) {
    const dig = () => {};
    dig();
  }

  private updateSpringForces() {}
}
