import { Point2D } from '../../../utils/vo';
import { BaseController } from './BaseController';

export class DefaultController extends BaseController {
  public drag(startPoint: Point2D) {
    const startCamera = {
      x: this.modelStore.viewport.camera.x,
      y: this.modelStore.viewport.camera.y,
    };
    return {
      move: (point: Point2D) => {
        if (!startPoint || !startCamera) return;
        this.modelStore.setCamera(
          startCamera.x - (point.y - startPoint.y) * 0.01,
          startCamera.y + (point.x - startPoint.x) * 0.01,
        );
      },
      end: (_point: Point2D) => {},
    };
  }

  public hover(_point: Point2D) {}

  public scroll(delta: number) {
    this.modelStore.setScale(this.modelStore.viewport.scale + delta * 0.1);
  }
}
