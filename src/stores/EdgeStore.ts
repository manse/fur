import { Point2D } from '../utils/geometry';
import { VertexStore } from './VertexStore';

export class EdgeStore {
  constructor(public v0: VertexStore, public v1: VertexStore) {}

  public equals(e: EdgeStore) {
    return (e.v0 === this.v0 && e.v1 === this.v1) || (e.v0 === this.v1 && e.v1 === this.v0);
  }

  public containsVertices(v0: VertexStore, v1: VertexStore) {
    return (v0 === this.v0 && v1 === this.v1) || (v0 === this.v1 && v1 === this.v0);
  }

  public calcMinimumLength(p: Point2D) {
    const x0 = this.v0.projection.x;
    const y0 = this.v0.projection.y;
    const x1 = this.v1.projection.x;
    const y1 = this.v1.projection.y;
    const a = y0 - y1;
    const b = x1 - x0;
    const c = x0 * y1 - x1 * y0;
    return Math.abs(a * p.x + b * p.y + c) / Math.sqrt(a * a + b * b);
  }
}
