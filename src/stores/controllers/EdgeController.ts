import { Point2D } from '../../utils/vo';
import { ControllerType, ModelStore } from '../ModelStore';
import { PartManagerStore } from '../PartManagerStore';
import { IController } from './IController';

type Stores = {
  modelStore: ModelStore;
  partManagerStore: PartManagerStore;
};

export class EdgeController implements IController {
  constructor(private stores: Stores) {}

  public start(point: Point2D) {
    this.evaluate(point);
  }

  public update(point: Point2D) {
    this.evaluate(point);
  }

  public finish(_: Point2D) {}

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
    if (partStore.includesEdge(edge)) {
      partStore.removeEdge(edge);
    } else {
      partStore.addEdge(edge);
    }
  }
}
