import { Point2D } from '../../utils/vo';
import { ControllerType } from '../EditorStore';
import { ModelStore } from '../ModelStore';
import { PartManagerStore } from '../PartManagerStore';
import { IController } from './IController';

type Stores = {
  modelStore: ModelStore;
  partManagerStore: PartManagerStore;
};

export class FragmentController implements IController {
  private toRemove = false;
  private dragging = false;
  private lastPoint: Point2D;

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
    this.lastPoint = point;
    if (!this.dragging) return;
    this.evaluate(point);
  }

  public finish(_: Point2D) {
    this.dragging = false;
  }

  public scroll(_: number) {}

  public render(context: CanvasRenderingContext2D) {
    if (!this.lastPoint) return;
    const fragment = this.stores.modelStore.getFragmentAtPoint(this.lastPoint);
    if (!fragment) return;
    context.fillStyle = 'rgba(255,255,0,0.3)';
    context.beginPath();
    context.moveTo(fragment.v0.projection.x, fragment.v0.projection.y);
    context.lineTo(fragment.v1.projection.x, fragment.v1.projection.y);
    context.lineTo(fragment.v2.projection.x, fragment.v2.projection.y);
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
