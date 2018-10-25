import { observable } from 'mobx';
import { Point2D } from '../utils/vo';
import { DefaultController } from './controllers/DefaultController';
import { EdgeController } from './controllers/EdgeController';
import { FragmentController } from './controllers/FragmentController';
import { IController } from './controllers/IController';
import { MultipleFragmentController, MultipleFragmentControllerMode } from './controllers/MultipleFragmentController';
import { ModelStore } from './ModelStore';
import { PartManagerStore } from './PartManagerStore';

const M_PI_2 = Math.PI / 2;

export enum EditorTab {
  model,
  pattern,
}

export enum ControllerType {
  default,
  fragment,
  edge,
  multipleFragmentAdd,
  multipleFragmentRemove,
}

export const EditorTabList = [EditorTab.model, EditorTab.pattern];

export class EditorStore {
  @observable
  public editorTab = EditorTab.model;
  @observable
  public controllerType: ControllerType = ControllerType.default;

  public viewport = {
    camera: {
      x: 0,
      y: 0,
    },
    scale: 100,
  };
  private defaultController: IController;
  private fragmentController: IController;
  private edgeController: IController;
  private multipleFragmentAddController: IController;
  private multipleFragmentRemoveController: IController;

  private pendingControllerType: ControllerType;
  private hasStarted = false;

  constructor(private stores: { modelStore: ModelStore; partManagerStore: PartManagerStore }) {
    window.addEventListener('keydown', e => {
      if (this.editorTab === EditorTab.model) {
        this.handleKeyboard(e);
      }
    });
    window.addEventListener('keyup', e => {
      if (this.editorTab === EditorTab.model) {
        this.handleKeyboard(e);
      }
    });

    this.defaultController = new DefaultController({ ...stores, editorStore: this });
    this.fragmentController = new FragmentController(stores);
    this.edgeController = new EdgeController(stores);
    this.multipleFragmentAddController = new MultipleFragmentController(stores, MultipleFragmentControllerMode.add);
    this.multipleFragmentRemoveController = new MultipleFragmentController(
      stores,
      MultipleFragmentControllerMode.remove,
    );
    this.resetController();
  }

  public setCamera(x: number, y: number) {
    this.viewport.camera.x = x;
    this.viewport.camera.y = y;
    if (this.viewport.camera.x < -M_PI_2) this.viewport.camera.x = -M_PI_2;
    else if (this.viewport.camera.x > M_PI_2) this.viewport.camera.x = M_PI_2;
    this.stores.modelStore.updateProjection(this.viewport);
    this.stores.modelStore.invalidate();
  }

  public setScale(scale: number) {
    this.viewport.scale = scale;
    if (this.viewport.scale < 1) this.viewport.scale = 1;
    this.stores.modelStore.updateProjection(this.viewport);
    this.stores.modelStore.invalidate();
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
    this.stores.modelStore.invalidate();
  }

  public performUpdate(point: Point2D) {
    this.getController().update(point);
    this.stores.modelStore.invalidate();
  }

  public performFinish(point: Point2D) {
    this.hasStarted = false;
    this.getController().finish(point);
    if (this.pendingControllerType) {
      this.controllerType = this.pendingControllerType;
      this.pendingControllerType = null;
    }
    this.stores.modelStore.invalidate();
  }

  public performScroll(delta: number) {
    this.getController().scroll(delta);
    this.stores.modelStore.invalidate();
  }

  public performRender(context: CanvasRenderingContext2D) {
    this.getController().render(context);
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

  public setEditorTab(editorTab: EditorTab) {
    this.editorTab = editorTab;
  }
}
