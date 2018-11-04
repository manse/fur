import { observable } from 'mobx';
import { project } from '../utils/m4';
import { Point3D } from '../utils/vo';

export class VertexStore {
  public id = Math.floor(Math.random() * 1e8).toString(36);
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

  public length(vertexStore: VertexStore) {
    const dx = vertexStore.position.x - this.position.x;
    const dy = vertexStore.position.y - this.position.y;
    const dz = vertexStore.position.z - this.position.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
}
