import { inject, observer } from 'mobx-react';
import { SIDEBAR_WIDTH } from '../constrants/Layout';
import { EdgeStore } from '../stores/EdgeStore';
import { ObjectModelStore } from '../stores/ObjectModelStore';
import { PartManagerStore } from '../stores/PartManagerStore';
import { WindowStore } from '../stores/WindowStore';
import { ligten, toRGBA } from '../utils/color';

type Props = {
  windowStore?: WindowStore;
  objectModelStore?: ObjectModelStore;
  partManagerStore?: PartManagerStore;
};

function render(canvas: HTMLCanvasElement, { objectModelStore, partManagerStore }: Props) {
  (canvas as any).onmousewheel = (e: MouseWheelEvent) => objectModelStore.handleMousewheel(e.wheelDelta);
  canvas.onmousedown = e =>
    objectModelStore.handleMousedown({
      x: e.x - canvas.width / 2,
      y: e.y - canvas.height / 2
    });
  canvas.onmousemove = e =>
    objectModelStore.handleMousemove({
      x: e.x - canvas.width / 2,
      y: e.y - canvas.height / 2
    });
  canvas.onmouseup = e =>
    objectModelStore.handleMouseup({
      x: e.x - canvas.width / 2,
      y: e.y - canvas.height / 2
    });

  const context = canvas.getContext('2d');
  context.save();
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.translate(canvas.width / 2, canvas.height / 2);
  const clockwiseEdges: EdgeStore[] = [];

  // fragments
  objectModelStore.fragmentStores.forEach(fragment => {
    const partStores = partManagerStore.filterPartStoresByFragment(fragment);
    const clockwise = fragment.isClockwise();
    context.lineWidth = 0.15;
    context.strokeStyle = clockwise ? 'black' : 'rgba(0,0,0,0.1)';
    context.beginPath();
    context.moveTo(fragment.v0.projection.x, fragment.v0.projection.y);
    context.lineTo(fragment.v1.projection.x, fragment.v1.projection.y);
    context.lineTo(fragment.v2.projection.x, fragment.v2.projection.y);
    context.closePath();
    context.stroke();
    if (clockwise) {
      clockwiseEdges.push(...fragment.edgeStores);
    }
    if (partStores.length > 0) {
      const color = partStores.length >= 2 ? 'magenta' : partStores[0].color;
      context.fillStyle = toRGBA(color, clockwise ? 0.4 : 0.1);
      context.fill();
    }
  });

  // edges (as darts)
  partManagerStore.partStores.forEach(part => {
    part.edgeStores.forEach(edge => {
      context.lineWidth = 3;
      context.strokeStyle = toRGBA(ligten(part.color, 0.6), clockwiseEdges.find(e => edge.equals(e)) ? 1 : 0.1);
      context.beginPath();
      context.moveTo(edge.v0.projection.x, edge.v0.projection.y);
      context.lineTo(edge.v1.projection.x, edge.v1.projection.y);
      context.stroke();
    });
  });

  // optional rendering
  objectModelStore.controller.render(context);

  context.restore();
}

export const ModelRenderer = inject('windowStore', 'objectModelStore', 'partManagerStore')(
  observer((props: Props) => {
    return (
      <canvas
        key={props.objectModelStore.key}
        width={props.windowStore.width - SIDEBAR_WIDTH}
        height={props.windowStore.height}
        ref={canvas => canvas && render(canvas, props)}
      />
    );
  })
);
