import { observable } from 'mobx';
import { EdgeStore } from '../../../stores/EdgeStore';
import { Point2D } from '../../../utils/vo';
import { BaseController } from './BaseController';

export class EdgeController extends BaseController {
  @observable
  public hoveredEdge: EdgeStore | void;

  public drag(point: Point2D) {
    const edge = this.modelStore.getNearestEdgeAtPoint(point);
    const toRemove =
      !!edge && this.partManagerStore.activePartStore && this.partManagerStore.activePartStore.includesEdge(edge);

    const evaluate = (point: Point2D) => {
      const edge = this.modelStore.getNearestEdgeAtPoint(point);
      if (!edge) return;
      const partStore = this.partManagerStore.activePartStore;
      if (!partStore) return;
      if (toRemove) {
        partStore.removeEdge(edge);
      } else {
        partStore.addEdge(edge);
      }
    };
    evaluate(point);
    return {
      move: evaluate,
      end() {},
    };
  }

  public scroll(_: number) {}

  public hover(point: Point2D) {
    this.hoveredEdge = this.modelStore.getNearestEdgeAtPoint(point);
  }
}
