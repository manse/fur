import { observable, runInAction } from 'mobx';
import { FragmentStore } from '../../../stores/FragmentStore';
import { PartStore } from '../../../stores/PartStore';
import { Point2D } from '../../../utils/vo';
import { BaseController } from './BaseController';

export abstract class BaseMultiFragmentController extends BaseController {
  @observable
  public startPoint: Point2D;
  @observable
  public endPoint: Point2D;

  public drag(startPoint: Point2D) {
    this.startPoint = this.endPoint = startPoint;

    const getBounds = () => {
      const left = Math.min(startPoint.x, this.endPoint.x);
      const right = Math.max(startPoint.x, this.endPoint.x);
      const top = Math.min(startPoint.y, this.endPoint.y);
      const bottom = Math.max(startPoint.y, this.endPoint.y);
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
      move: ({ x, y }: Point2D) => {
        this.endPoint = { x, y };
      },
      end: () => {
        const partStore = this.partManagerStore.activePartStore;
        if (partStore) {
          const fragments = getIntersectionFragments();
          runInAction(() => {
            fragments.forEach(fragment => this.controlFragment(partStore, fragment));
          });
        }
        this.startPoint = this.endPoint = null;
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
    partStore.removeFragment(target);
  }
}
