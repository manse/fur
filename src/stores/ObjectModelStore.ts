import { observable } from 'mobx';
import { identity, multiply, rotationX, rotationY, scaling } from '../utils/m4';
import { Point2D } from '../utils/vo';
import { DefaultController } from './controllers/DefaultController';
import { FragmentController } from './controllers/FragmentController';
import { IController } from './controllers/IController';
import { EdgeStore } from './EdgeStore';
import { FragmentStore } from './FragmentStore';
import { VertexStore } from './VertexStore';

export const M_PI_2 = Math.PI / 2;

enum ControllerType {
  default,
  fragment,
  edge,
  multipleFragment
}

export class ObjectModelStore {
  @observable
  public verticeStores: VertexStore[] = [];
  @observable
  public fragmentStores: FragmentStore[] = [];
  @observable
  public camera: Point2D = {
    x: 0,
    y: 0
  };
  @observable
  public scale = 100;
  @observable
  public key = 0;

  public controller: IController = new DefaultController();

  private dragging = false;

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

  public setCamera(x: number, y: number) {
    this.camera.x = x;
    this.camera.y = y;
    if (this.camera.x < -M_PI_2) this.camera.x = -M_PI_2;
    else if (this.camera.x > M_PI_2) this.camera.x = M_PI_2;
    this.updateProjection();
    this.invalidate();
  }

  public setScale(scale: number) {
    this.scale = scale;
    if (this.scale < 1) this.scale = 1;
    this.updateProjection();
    this.invalidate();
  }

  public invalidate() {
    this.key++;
  }

  public handleMousedown(point: Point2D) {
    this.controller.start(point);
    this.dragging = true;
    this.invalidate();
  }

  public handleMousemove(point: Point2D) {
    this.controller.update(point);
    this.invalidate();
  }

  public handleMouseup(point: Point2D) {
    this.controller.finish(point);
    this.dragging = false;
    this.invalidate();
  }

  public handleMousewheel(delta: number) {
    this.controller.scroll(delta);
    this.invalidate();
  }

  public handleKeyboard(e: KeyboardEvent) {
    if (this.dragging) return;
    const ctrl = e.metaKey || e.ctrlKey;
    const alt = e.altKey;
    if (ctrl && alt) {
      this.setController(ControllerType.multipleFragment);
    } else if (ctrl) {
      this.setController(ControllerType.fragment);
    } else if (alt) {
      this.setController(ControllerType.edge);
    } else {
      this.setController(ControllerType.default);
    }
  }

  public setController(type: ControllerType) {
    switch (type) {
      case ControllerType.default:
        this.controller = new DefaultController();
        break;
      case ControllerType.fragment:
        this.controller = new FragmentController();
        break;
      default:
        return;
    }
    this.invalidate();
  }

  public resetController() {
    this.setController(ControllerType.default);
  }

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
              z: (v0.position.z + v1.position.z + v2.position.z + v3.position.z) / 4
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
    this.invalidate();
  }

  private updateProjection() {
    const camera = identity();
    multiply(rotationY(this.camera.y), camera, camera);
    multiply(rotationX(this.camera.x), camera, camera);
    multiply(scaling([this.scale, this.scale, this.scale]), camera, camera);
    this.verticeStores.forEach(v => v.project(camera));
  }
}
