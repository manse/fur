import { observable } from 'mobx';
import { project } from '../utils/m4';
import { Point3D } from './vo';

export class VertexStore {
  @observable
  public projection: Point3D = { x: 0, y: 0, z: 0 };

  constructor(public position: Point3D) {
    this.projection.x = position.x;
    this.projection.y = position.y;
    this.projection.z = position.z;
  }

  public createFloat64Array() {
    return new Float64Array([this.position.x, this.position.y, this.position.z]);
  }

  public project(projection: Float64Array) {
    const [x, y, z] = project(projection, this.createFloat64Array());
    this.projection.x = x;
    this.projection.y = y;
    this.projection.z = z;
  }
}
