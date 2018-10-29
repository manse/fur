import { ModelStore } from '../../../stores/ModelStore';
import { PartManagerStore } from '../../../stores/PartManagerStore';
import { Point2D } from '../../../utils/vo';

export abstract class BaseController {
  protected modelStore: ModelStore;
  protected partManagerStore: PartManagerStore;

  constructor({ modelStore, partManagerStore }: { modelStore: ModelStore; partManagerStore: PartManagerStore }) {
    this.modelStore = modelStore;
    this.partManagerStore = partManagerStore;
  }

  abstract drag(
    p: Point2D,
  ): {
    move(p: Point2D): void;
    end(p: Point2D): void;
  };
  abstract hover(p: Point2D): void;
  abstract scroll(delta: number): void;
}
