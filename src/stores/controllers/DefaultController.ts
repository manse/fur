import stores from '..';
import { Point2D } from '../../utils/vo';
import { IController } from './IController';

export class DefaultController implements IController {
  private startPoint: Point2D;
  private startCamera: Point2D;

  public start(point: Point2D) {
    this.startPoint = point;
    this.startCamera = {
      x: stores.objectModelStore.camera.x,
      y: stores.objectModelStore.camera.y
    };
  }

  public update(point: Point2D) {
    if (!this.startPoint || !this.startCamera) return;
    stores.objectModelStore.setCamera(
      this.startCamera.x - (point.y - this.startPoint.y) * 0.01,
      this.startCamera.y + (point.x - this.startPoint.x) * 0.01
    );
  }

  public finish(_: Point2D) {
    this.startPoint = this.startCamera = null;
  }

  public scroll(delta: number) {
    stores.objectModelStore.setScale(stores.objectModelStore.scale + delta * 0.1);
  }

  public render(_: CanvasRenderingContext2D) {}
}
