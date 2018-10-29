import { FragmentStore } from '../../../stores/FragmentStore';
import { PartStore } from '../../../stores/PartStore';
import { Point2D } from '../../../utils/vo';
import { BaseController } from './BaseController';

abstract class BaseMultiFragmentController extends BaseController {
  public drag(startPoint: Point2D) {
    const endPoint = {
      x: startPoint.x,
      y: startPoint.y,
    };

    const getBounds = () => {
      const left = Math.min(startPoint.x, endPoint.x);
      const right = Math.max(startPoint.x, endPoint.x);
      const top = Math.min(startPoint.y, endPoint.y);
      const bottom = Math.max(startPoint.y, endPoint.y);
      const width = right - left;
      const height = bottom - top;
      return {
        left,
        right,
        top,
        bottom,
        width,
        height,
      };
    };

    const getIntersectionFragments = () => {
      const { left, top, right, bottom } = getBounds();
      return this.modelStore.fragmentStores.filter(
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
              fragment.v2.projection.y < bottom)),
      );
    };

    return {
      move: () => {},
      end: () => {
        const partStore = this.partManagerStore.activePartStore;
        if (!partStore) return;
        getIntersectionFragments().forEach(fragment => {
          this.controlFragment(partStore, fragment);
        });
      },
    };
  }

  public scroll(_: number) {}

  public hover() {}

  abstract controlFragment(partStore: PartStore, target: FragmentStore): void;
}

export class AddMultiFragmentController extends BaseMultiFragmentController {
  public controlFragment(partStore: PartStore, target: FragmentStore) {
    partStore.addFragment(target);
  }
}

export class RemoveMultiFragmentController extends BaseMultiFragmentController {
  public controlFragment(partStore: PartStore, target: FragmentStore) {
    partStore.addFragment(target);
  }
}
