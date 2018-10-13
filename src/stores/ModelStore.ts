import { observable } from 'mobx';
import { identity, multiply, rotationX, rotationY, scaling } from '../utils/m4';
import { Point2D } from '../utils/vo';
import { DefaultController } from './controllers/DefaultController';
import { EdgeController } from './controllers/EdgeController';
import { FragmentController } from './controllers/FragmentController';
import { IController } from './controllers/IController';
import { MultipleFragmentController, MultipleFragmentControllerMode } from './controllers/MultipleFragmentController';
import { EdgeStore } from './EdgeStore';
import { FragmentStore } from './FragmentStore';
import { PartManagerStore } from './PartManagerStore';
import { VertexStore } from './VertexStore';

export const M_PI_2 = Math.PI / 2;

export enum ControllerType {
  default,
  fragment,
  edge,
  multipleFragmentAdd,
  multipleFragmentRemove
}

export class ModelStore {
  @observable
  public key = 0;
  @observable
  public controller: IController;

  public verticeStores: VertexStore[] = [];
  public fragmentStores: FragmentStore[] = [];
  public camera: Point2D = {
    x: 0,
    y: 0
  };
  public scale = 100;
  private partManagerStore: PartManagerStore;

  constructor({ partManagerStore }: { partManagerStore: PartManagerStore }) {
    this.partManagerStore = partManagerStore;
    this.resetController();
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

  public handleKeyboard(e: KeyboardEvent) {
    const shift = e.shiftKey;
    const ctrl = e.metaKey || e.ctrlKey;
    const key = e.type === 'keyup' ? '' : String.fromCharCode(e.which);
    if (key === 'A') {
      this.setController(ControllerType.multipleFragmentAdd);
    } else if (key === 'Z') {
      this.setController(ControllerType.multipleFragmentRemove);
    } else if (shift) {
      this.setController(ControllerType.fragment);
    } else if (ctrl) {
      this.setController(ControllerType.edge);
    } else {
      this.setController(ControllerType.default);
    }
  }

  public setController(type: ControllerType) {
    const stores = {
      modelStore: this,
      partManagerStore: this.partManagerStore
    };
    switch (type) {
      case ControllerType.default:
        this.controller = new DefaultController(stores);
        break;
      case ControllerType.fragment:
        this.controller = new FragmentController(stores);
        break;
      case ControllerType.edge:
        this.controller = new EdgeController(stores);
        break;
      case ControllerType.multipleFragmentAdd:
        this.controller = new MultipleFragmentController(stores, MultipleFragmentControllerMode.add);
        break;
      case ControllerType.multipleFragmentRemove:
        this.controller = new MultipleFragmentController(stores, MultipleFragmentControllerMode.remove);
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
