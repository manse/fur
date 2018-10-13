import { inject, observer } from 'mobx-react';
import { Component } from 'react';
import { EdgeStore } from '../stores/EdgeStore';
import { ModelStore } from '../stores/ModelStore';
import { PartManagerStore } from '../stores/PartManagerStore';
import { ligten, toRGBA } from '../utils/color';

type Props = {
  modelStore?: ModelStore;
  partManagerStore?: PartManagerStore;
};

function handleEvent(canvas: HTMLCanvasElement, { modelStore }: Props) {
  (canvas as any).onmousewheel = (e: MouseWheelEvent) => modelStore.controller.scroll(e.wheelDelta);
  canvas.onmousedown = e => {
    const controller = modelStore.controller;
    controller.start({
      x: e.x - canvas.width / 2,
      y: e.y - canvas.height / 2
    });
    const mousemove = (e: MouseEvent) => {
      controller.update({
        x: e.x - canvas.width / 2,
        y: e.y - canvas.height / 2
      });
    };
    const mouseup = (e: MouseEvent) => {
      controller.finish({
        x: e.x - canvas.width / 2,
        y: e.y - canvas.height / 2
      });
      window.removeEventListener('mousemove', mousemove);
      window.removeEventListener('mouseup', mouseup);
    };
    window.addEventListener('mousemove', mousemove);
    window.addEventListener('mouseup', mouseup);
  };
}

function render(canvas: HTMLCanvasElement, { modelStore, partManagerStore }: Props) {
  canvas.width = (canvas.parentNode as any).offsetWidth;
  canvas.height = (canvas.parentNode as any).offsetHeight;

  const context = canvas.getContext('2d');
  context.save();
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.translate(canvas.width / 2, canvas.height / 2);
  const clockwiseEdges: EdgeStore[] = [];

  // fragments
  modelStore.fragmentStores.forEach(fragment => {
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
  modelStore.controller.render(context);

  context.restore();
}

@inject('modelStore', 'partManagerStore')
@observer
export class ModelRenderer extends Component<Props> {
  public componentDidMount() {
    window.addEventListener('resize', this.invalidate);
  }

  public componentWillUnmount() {
    window.removeEventListener('resize', this.invalidate);
  }

  private invalidate = () => {
    this.props.modelStore.invalidate();
  };

  public render() {
    return (
      <canvas
        key={this.props.modelStore.key}
        ref={canvas => {
          if (canvas) {
            render(canvas, this.props);
            handleEvent(canvas, this.props);
          }
        }}
      />
    );
  }
}
