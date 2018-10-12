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
  (canvas as any).onmousewheel = (e: MouseWheelEvent) => {
    objectModelStore.setScale(objectModelStore.scale + e.wheelDelta * 0.1);
  };
  canvas.onmousedown = e => {
    const start = {
      x: e.clientX,
      y: e.clientY
    };
    const initialCamera = {
      x: objectModelStore.camera.x,
      y: objectModelStore.camera.y
    };
    function mousemove(e: MouseEvent) {
      objectModelStore.setCamera(
        initialCamera.x - (e.clientY - start.y) * 0.01,
        initialCamera.y + (e.clientX - start.x) * 0.01
      );
    }
    function mouseup() {
      window.removeEventListener('mousemove', mousemove as any);
      window.removeEventListener('mouseup', mouseup);
    }
    window.addEventListener('mousemove', mousemove as any);
    window.addEventListener('mouseup', mouseup);
  };

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
