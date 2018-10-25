import { Point2D } from '../../utils/vo';
import { ControllerType } from '../EditorStore';
import { ModelStore } from '../ModelStore';
import { PartManagerStore } from '../PartManagerStore';
import { IController } from './IController';

type Stores = {
  modelStore: ModelStore;
  partManagerStore: PartManagerStore;
};

export class EdgeController implements IController {
  private toRemove = false;
  private dragging = false;

  constructor(private stores: Stores) {}

  public start(point: Point2D) {
    this.dragging = true;
    const edge = this.stores.modelStore.getNearestEdgeAtPoint(point);
    this.toRemove =
      !!edge &&
      this.stores.partManagerStore.activePartStore &&
      this.stores.partManagerStore.activePartStore.includesEdge(edge);
    this.evaluate(point);
  }

  public update(point: Point2D) {
    if (!this.dragging) return;
    this.evaluate(point);
  }

  public finish(_: Point2D) {
    this.dragging = false;
  }

  public scroll(_: number) {}

  public render(_: CanvasRenderingContext2D) {}

  public get type() {
    return ControllerType.edge;
  }

  private evaluate(point: Point2D) {
    const edge = this.stores.modelStore.getNearestEdgeAtPoint(point);
    if (!edge) return;
    const partStore = this.stores.partManagerStore.activePartStore;
    if (!partStore) return;
    if (this.toRemove) {
      partStore.removeEdge(edge);
    } else {
      partStore.addEdge(edge);
    }
  }
}
