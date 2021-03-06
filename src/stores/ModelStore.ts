import { action } from 'mobx';
import { Point2D } from '../utils/geometry';
import { identity, multiply, rotationX, rotationY, scaling } from '../utils/m4';
import { EdgeStore } from './EdgeStore';
import { FragmentStore } from './FragmentStore';
import { VertexStore } from './VertexStore';

export const M_PI_2 = Math.PI / 2;

export class ModelStore {
  public verticeStores: VertexStore[] = [];
  public fragmentStores: FragmentStore[] = [];
  public viewport = {
    camera: {
      x: 0,
      y: 0,
    },
    scale: 100,
  };

  @action
  public setCamera(x: number, y: number) {
    this.viewport.camera.x = x;
    this.viewport.camera.y = y;
    if (this.viewport.camera.x < -M_PI_2) this.viewport.camera.x = -M_PI_2;
    else if (this.viewport.camera.x > M_PI_2) this.viewport.camera.x = M_PI_2;
    this.updateProjection();
  }

  @action
  public setScale(scale: number) {
    this.viewport.scale = scale;
    if (this.viewport.scale < 1) this.viewport.scale = 1;
    this.updateProjection();
  }

  public getFragmentAtPoint(p: Point2D) {
    const frags = this.fragmentStores.filter(f => f.testIntersection(p));
    frags.sort((a, b) => (a.calcAverageOfProjectionZ() < b.calcAverageOfProjectionZ() ? 1 : -1));
    return frags[0];
  }

  public getNearestEdgeAtPoint(p: Point2D): EdgeStore | void {
    const fragment = this.getFragmentAtPoint(p);
    if (!fragment) return;
    return fragment.getNearestEdge(p);
  }

  @action
  public loadModelFromObjString(obj: string) {
    this.verticeStores = [];
    this.fragmentStores = [];
    const quadCenterVertices: VertexStore[] = [];
    obj.split('\n').forEach(line => {
      const values = line.split(' ').slice(1);
      switch (line[0]) {
        case 'v':
          const [x, y, z] = values.map(s => parseFloat(s));
          this.verticeStores.push(new VertexStore({ x: -x, y: -y, z: -z }));
          break;
        case 'f':
          const [v0, v1, v2, v3] = values.map(s => this.verticeStores[parseInt(s, 10) - 1]);
          if (v3) {
            const centerVertex = new VertexStore({
              x: (v0.position.x + v1.position.x + v2.position.x + v3.position.x) / 4,
              y: (v0.position.y + v1.position.y + v2.position.y + v3.position.y) / 4,
              z: (v0.position.z + v1.position.z + v2.position.z + v3.position.z) / 4,
            });
            quadCenterVertices.push(centerVertex);
            this.fragmentStores.push(new FragmentStore(v0, v1, centerVertex));
            this.fragmentStores.push(new FragmentStore(v1, v2, centerVertex));
            this.fragmentStores.push(new FragmentStore(v2, v3, centerVertex));
            this.fragmentStores.push(new FragmentStore(v3, v0, centerVertex));
          } else {
            this.fragmentStores.push(new FragmentStore(v0, v1, v2));
          }
          break;
      }
    });
    this.verticeStores = [...this.verticeStores, ...quadCenterVertices];
    this.updateProjection();
  }

  public updateProjection() {
    const camera = identity();
    multiply(rotationY(this.viewport.camera.y), camera, camera);
    multiply(rotationX(this.viewport.camera.x), camera, camera);
    multiply(scaling([this.viewport.scale, this.viewport.scale, this.viewport.scale]), camera, camera);
    this.verticeStores.forEach(v => v.project(camera));
  }
}
