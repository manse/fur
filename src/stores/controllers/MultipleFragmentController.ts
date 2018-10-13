import { Point2D } from '../../utils/vo';
import { ControllerType, ModelStore } from '../ModelStore';
import { PartManagerStore } from '../PartManagerStore';
import { IController } from './IController';

type Stores = {
  modelStore: ModelStore;
  partManagerStore: PartManagerStore;
};

export enum MultipleFragmentControllerMode {
  add,
  remove
}

export class MultipleFragmentController implements IController {
  private startPoint: Point2D;
  private endPoint: Point2D;

  constructor(private stores: Stores, private mode: MultipleFragmentControllerMode) {}

  public start(point: Point2D) {
    this.startPoint = this.endPoint = point;
  }

  public update(point: Point2D) {
    this.endPoint = point;
  }

  public finish(_: Point2D) {
    const partStore = this.stores.partManagerStore.activePartStore;
    if (!partStore) return;
    this.getIntersectionFragments().forEach(fragment => {
      switch (this.mode) {
        case MultipleFragmentControllerMode.add:
          partStore.addFragment(fragment);
          break;
        case MultipleFragmentControllerMode.remove:
          partStore.removeFragment(fragment);
          break;
      }
    });
    this.startPoint = this.endPoint = null;
  }

  public scroll(_: number) {}

  private getBounds() {
    const left = Math.min(this.startPoint.x, this.endPoint.x);
    const right = Math.max(this.startPoint.x, this.endPoint.x);
    const top = Math.min(this.startPoint.y, this.endPoint.y);
    const bottom = Math.max(this.startPoint.y, this.endPoint.y);
    const width = right - left;
    const height = bottom - top;
    return {
      left,
      right,
      top,
      bottom,
      width,
      height
    };
  }

  private getIntersectionFragments() {
    const { left, top, right, bottom } = this.getBounds();
    return this.stores.modelStore.fragmentStores.filter(
      fragment =>
        fragment.isClockwise() &&
        ((left < fragment.v0.projection.x &&
          fragment.v0.projection.x < right &&
          top < fragment.v0.projection.y &&
          fragment.v0.projection.y < bottom) ||
          (left < fragment.v1.projection.x &&
            fragment.v1.projection.x < right &&
            top < fragment.v1.projection.y &&
            fragment.v1.projection.y < bottom) ||
          (left < fragment.v2.projection.x &&
            fragment.v2.projection.x < right &&
            top < fragment.v2.projection.y &&
            fragment.v2.projection.y < bottom))
    );
  }

  public render(context: CanvasRenderingContext2D) {
    if (!this.startPoint || !this.endPoint) return;
    const { left, top, width, height } = this.getBounds();
    context.lineWidth = 0.5;
    context.strokeStyle = 'red';
    context.strokeRect(left, top, width, height);

    switch (this.mode) {
      case MultipleFragmentControllerMode.add:
        context.fillStyle = 'rgba(255,255,0,0.3)';
        break;
      case MultipleFragmentControllerMode.remove:
        context.fillStyle = 'rgba(255,0,255,0.3)';
        break;
    }
    context.beginPath();
    this.getIntersectionFragments().forEach(fragment => {
      context.moveTo(fragment.v0.projection.x, fragment.v0.projection.y);
      context.lineTo(fragment.v1.projection.x, fragment.v1.projection.y);
      context.lineTo(fragment.v2.projection.x, fragment.v2.projection.y);
    });
    context.fill();
  }

  public get type() {
    switch (this.mode) {
      case MultipleFragmentControllerMode.add:
        return ControllerType.multipleFragmentAdd;
      case MultipleFragmentControllerMode.remove:
        return ControllerType.multipleFragmentRemove;
    }
  }
}
