import { Point2D } from '../../utils/vo';

export interface IController {
  start(p: Point2D): void;
  update(p: Point2D): void;
  finish(p: Point2D): void;
  scroll(delta: number): void;
  render(context: CanvasRenderingContext2D): void;
}
