import { Point2D } from '../../utils/vo';
import { ControllerType } from '../ModelStore';

export interface IController {
  start(p: Point2D): void;
  update(p: Point2D): void;
  finish(p: Point2D): void;
  scroll(delta: number): void;
  render(context: CanvasRenderingContext2D): void;
  type: ControllerType;
}
