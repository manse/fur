import { Point2D } from '../../utils/vo';
import { ControllerType, EditorStore } from '../EditorStore';
import { IController } from './IController';

type Stores = {
  editorStore: EditorStore;
};

export class DefaultController implements IController {
  private startPoint: Point2D;
  private startCamera: Point2D;

  constructor(private stores: Stores) {}

  public start(point: Point2D) {
    this.startPoint = point;
    this.startCamera = {
      x: this.stores.editorStore.viewport.camera.x,
      y: this.stores.editorStore.viewport.camera.y
    };
  }

  public update(point: Point2D) {
    if (!this.startPoint || !this.startCamera) return;
    this.stores.editorStore.setCamera(
      this.startCamera.x - (point.y - this.startPoint.y) * 0.01,
      this.startCamera.y + (point.x - this.startPoint.x) * 0.01
    );
  }

  public finish(_: Point2D) {
    this.startPoint = this.startCamera = null;
  }

  public scroll(delta: number) {
    this.stores.editorStore.setScale(this.stores.editorStore.viewport.scale + delta * 0.1);
  }

  public render(_: CanvasRenderingContext2D) {}

  public get type() {
    return ControllerType.default;
  }
}
