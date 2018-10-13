import stores from '..';
import { Point2D } from '../../utils/vo';
import { FragmentStore } from '../FragmentStore';
import { IController } from './IController';

export class FragmentController implements IController {
  private dragging = false;
  private hoverFragment: FragmentStore;
  private toRemove = false;

  public start(point: Point2D) {
    this.dragging = true;
    const fragment = stores.objectModelStore.getFragmentAtPoint(point);
    this.toRemove =
      stores.partManagerStore.activePartStore &&
      stores.partManagerStore.activePartStore.includesFragmentStore(fragment);
    this.evaluate(point);
  }

  public update(point: Point2D) {
    if (this.dragging) {
      this.evaluate(point);
    } else {
      this.hoverFragment = stores.objectModelStore.getFragmentAtPoint(point);
    }
  }

  public finish(_: Point2D) {
    stores.objectModelStore.resetController();
  }

  public scroll(_: number) {}

  public render(context: CanvasRenderingContext2D) {
    if (!this.hoverFragment || this.dragging) return;
    context.fillStyle = 'LightYellow';
    context.beginPath();
    context.moveTo(this.hoverFragment.v0.projection.x, this.hoverFragment.v0.projection.y);
    context.lineTo(this.hoverFragment.v1.projection.x, this.hoverFragment.v1.projection.y);
    context.lineTo(this.hoverFragment.v2.projection.x, this.hoverFragment.v2.projection.y);
    context.closePath();
    context.fill();
  }

  private evaluate(point: Point2D) {
    const fragment = stores.objectModelStore.getFragmentAtPoint(point);
    if (!fragment) return;
    const partStore = stores.partManagerStore.activePartStore;
    if (!partStore) return;
    if (this.toRemove) {
      partStore.removeFragment(fragment);
    } else {
      partStore.addFragment(fragment);
    }
  }
}
