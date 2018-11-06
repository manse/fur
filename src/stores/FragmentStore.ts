import { Point2D } from '../utils/vo';
import { EdgeStore } from './EdgeStore';
import { VertexStore } from './VertexStore';

function sign(p1: Point2D, p2: Point2D, p3: Point2D) {
  return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
}

export class FragmentStore {
  public readonly id = Math.floor(Math.random() * 1e12).toString(36);
  public edgeStores: EdgeStore[] = [];
  public vertexStores: VertexStore[] = [];

  constructor(public v0: VertexStore, public v1: VertexStore, public v2: VertexStore) {
    this.edgeStores = [new EdgeStore(v0, v1), new EdgeStore(v1, v2), new EdgeStore(v2, v0)];
    this.vertexStores = [v0, v1, v2];
  }

  public containsEdge(edgeStore: EdgeStore) {
    return this.edgeStores.some(e => e.equals(edgeStore));
  }

  public testIntersection(point: Point2D) {
    const b1 = sign(point, this.v0.projection, this.v1.projection) <= 0;
    const b2 = sign(point, this.v1.projection, this.v2.projection) <= 0;
    const b3 = sign(point, this.v2.projection, this.v0.projection) <= 0;
    return b1 === b2 && b2 === b3;
  }

  public calcAverageOfProjectionZ() {
    return (this.v0.projection.z + this.v1.projection.z + this.v2.projection.z) / 3;
  }

  public isClockwise() {
    return (
      (this.v1.projection.y - this.v0.projection.y) * (this.v2.projection.x - this.v1.projection.x) -
        (this.v1.projection.x - this.v0.projection.x) * (this.v2.projection.y - this.v1.projection.y) >
      0
    );
  }

  public isClockwiseVertices(v0: VertexStore, v1: VertexStore) {
    return (
      (v0 === this.v0 && v1 === this.v1) || (v0 === this.v1 && v1 === this.v2) || (v0 === this.v2 && v1 === this.v0)
    );
  }

  public getNearestEdge(p: Point2D): EdgeStore {
    const edges = this.edgeStores.map(edgeStore => ({ edgeStore, length: edgeStore.calcMinimumLength(p) }));
    edges.sort((a, b) => (a.length > b.length ? 1 : -1));
    return edges[0].edgeStore;
  }
}
