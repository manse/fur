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
  default = 'default',
  fragment = 'fragment',
  edge = 'edge',
  multipleFragmentAdd = 'multipleFragmentAdd',
  multipleFragmentRemove = 'multipleFragmentRemove'
}

export class ModelStore {
  @observable
  public key = 0;
  @observable
  public controllerType: ControllerType = ControllerType.default;

  public verticeStores: VertexStore[] = [];
  public fragmentStores: FragmentStore[] = [];
  public camera: Point2D = {
    x: 0,
    y: 0
  };
  public scale = 100;
  private defaultController: IController;
  private fragmentController: IController;
  private edgeController: IController;
  private multipleFragmentAddController: IController;
  private multipleFragmentRemoveController: IController;

  private pendingControllerType: ControllerType;
  private hasStarted = false;

  constructor({ partManagerStore }: { partManagerStore: PartManagerStore }) {
    const stores = {
      modelStore: this,
      partManagerStore
    };
    this.defaultController = new DefaultController(stores);
    this.fragmentController = new FragmentController(stores);
    this.edgeController = new EdgeController(stores);
    this.multipleFragmentAddController = new MultipleFragmentController(stores, MultipleFragmentControllerMode.add);
    this.multipleFragmentRemoveController = new MultipleFragmentController(
      stores,
      MultipleFragmentControllerMode.remove
    );
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

  public handleKeyboard(e: KeyboardEvent) {
    const shift = e.shiftKey;
    const ctrl = e.metaKey || e.ctrlKey;
    const key = e.type === 'keyup' ? '' : String.fromCharCode(e.which);
    let nextControllerType: ControllerType;
    if (key === 'A') {
      nextControllerType = ControllerType.multipleFragmentAdd;
    } else if (key === 'Z') {
      nextControllerType = ControllerType.multipleFragmentRemove;
    } else if (shift) {
      nextControllerType = ControllerType.fragment;
    } else if (ctrl) {
      nextControllerType = ControllerType.edge;
    } else {
      nextControllerType = ControllerType.default;
    }
    if (this.hasStarted) {
      this.pendingControllerType = nextControllerType;
    } else {
      this.controllerType = nextControllerType;
    }
  }

  public resetController() {
    this.controllerType = ControllerType.default;
  }

  public performStart(point: Point2D) {
    this.hasStarted = true;
    this.getController().start(point);
    this.invalidate();
  }

  public performUpdate(point: Point2D) {
    this.getController().update(point);
    this.invalidate();
  }

  public performFinish(point: Point2D) {
    this.hasStarted = false;
    this.getController().finish(point);
    if (this.pendingControllerType) {
      this.controllerType = this.pendingControllerType;
      this.pendingControllerType = null;
    }
    this.invalidate();
  }

  public performScroll(delta: number) {
    this.getController().scroll(delta);
    this.invalidate();
  }

  public performRender(context: CanvasRenderingContext2D) {
    this.getController().render(context);
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

  private getController(): IController {
    switch (this.controllerType) {
      case ControllerType.default:
        return this.defaultController;
      case ControllerType.fragment:
        return this.fragmentController;
      case ControllerType.edge:
        return this.edgeController;
      case ControllerType.multipleFragmentAdd:
        return this.multipleFragmentAddController;
      case ControllerType.multipleFragmentRemove:
        return this.multipleFragmentRemoveController;
    }
  }

  private invalidate() {
    this.key++;
  }
}
