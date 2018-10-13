import { Point2D } from '../../utils/vo';
import { ControllerType, ModelStore } from '../ModelStore';
import { IController } from './IController';

type Stores = {
  modelStore: ModelStore;
};

export class DefaultController implements IController {
  private startPoint: Point2D;
  private startCamera: Point2D;

  constructor(private stores: Stores) {}

  public start(point: Point2D) {
    this.startPoint = point;
    this.startCamera = {
      x: this.stores.modelStore.camera.x,
      y: this.stores.modelStore.camera.y
    };
  }

  public update(point: Point2D) {
    if (!this.startPoint || !this.startCamera) return;
    this.stores.modelStore.setCamera(
      this.startCamera.x - (point.y - this.startPoint.y) * 0.01,
      this.startCamera.y + (point.x - this.startPoint.x) * 0.01
    );
  }

  public finish(_: Point2D) {
    this.startPoint = this.startCamera = null;
  }

  public scroll(delta: number) {
    this.stores.modelStore.setScale(this.stores.modelStore.scale + delta * 0.1);
  }

  public render(_: CanvasRenderingContext2D) {}

  public get type() {
    return ControllerType.default;
  }
}
