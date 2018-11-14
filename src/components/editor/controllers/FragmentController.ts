import { observable } from 'mobx';
import { FragmentStore } from '../../../stores/FragmentStore';
import { Point2D } from '../../../utils/geometry';
import { BaseController } from './BaseController';

export class FragmentController extends BaseController {
  @observable
  public hoveredFragment: FragmentStore;

  public drag(point: Point2D) {
    const fragment = this.modelStore.getFragmentAtPoint(point);
    const toRemove =
      this.partManagerStore.activePartStore && this.partManagerStore.activePartStore.includesFragmentStore(fragment);

    const evaluate = (point: Point2D) => {
      const fragment = this.modelStore.getFragmentAtPoint(point);
      if (!fragment) return;
      const partStore = this.partManagerStore.activePartStore;
      if (!partStore) return;
      if (toRemove) {
        partStore.removeFragment(fragment);
      } else {
        partStore.addFragment(fragment);
      }
    };
    evaluate(point);
    return {
      move: evaluate,
      end() {},
    };
  }

  public hover(point: Point2D) {
    this.hoveredFragment = this.modelStore.getFragmentAtPoint(point);
  }

  public scroll(_: number) {}
}
