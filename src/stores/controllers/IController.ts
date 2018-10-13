import { Point2D } from '../../utils/vo';

export enum ControllerType {
  default,
  fragment,
  edge,
  multipleFragment
}
export interface IController {
  start(p: Point2D): void;
  update(p: Point2D): void;
  finish(p: Point2D): void;
  scroll(delta: number): void;
  render(context: CanvasRenderingContext2D): void;
  type: ControllerType;
}
