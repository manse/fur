import { Point2D } from '../../../utils/geometry';
import { BaseController } from './BaseController';

export class ZoomController extends BaseController {
  public drag(startPoint: Point2D) {
    const startScale = this.modelStore.viewport.scale;
    return {
      move: (point: Point2D) => {
        if (!startPoint) return;
        const delta = point.x - startPoint.x;
        this.modelStore.setScale(startScale + delta * 0.1);
      },
      end: (_point: Point2D) => {},
    };
  }

  public hover(_point: Point2D) {}

  public scroll(_: number) {}
}
