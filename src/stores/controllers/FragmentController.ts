import { Point2D } from '../../utils/vo';
import { FragmentStore } from '../FragmentStore';
import { ModelStore } from '../ModelStore';
import { PartManagerStore } from '../PartManagerStore';
import { ControllerType, IController } from './IController';

type Stores = {
  modelStore: ModelStore;
  partManagerStore: PartManagerStore;
};

export class FragmentController implements IController {
  private dragging = false;
  private hoverFragment: FragmentStore;
  private toRemove = false;

  constructor(private stores: Stores) {}

  public start(point: Point2D) {
    this.dragging = true;
    const fragment = this.stores.modelStore.getFragmentAtPoint(point);
    this.toRemove =
      this.stores.partManagerStore.activePartStore &&
      this.stores.partManagerStore.activePartStore.includesFragmentStore(fragment);
    this.evaluate(point);
  }

  public update(point: Point2D) {
    if (this.dragging) {
      this.evaluate(point);
    } else {
      this.hoverFragment = this.stores.modelStore.getFragmentAtPoint(point);
    }
  }

  public finish(_: Point2D) {
    this.stores.modelStore.resetController();
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

  public get type() {
    return ControllerType.fragment;
  }

  private evaluate(point: Point2D) {
    const fragment = this.stores.modelStore.getFragmentAtPoint(point);
    if (!fragment) return;
    const partStore = this.stores.partManagerStore.activePartStore;
    if (!partStore) return;
    if (this.toRemove) {
      partStore.removeFragment(fragment);
    } else {
      partStore.addFragment(fragment);
    }
  }
}
