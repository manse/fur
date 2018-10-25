import { inject, observer } from 'mobx-react';
import { Component } from 'react';
import { EdgeStore } from '../../stores/EdgeStore';
import { EditorStore } from '../../stores/EditorStore';
import { ModelStore } from '../../stores/ModelStore';
import { PartManagerStore } from '../../stores/PartManagerStore';
import { ligten, toRGBA } from '../../utils/color';

type Props = {
  editorStore?: EditorStore;
  modelStore?: ModelStore;
  partManagerStore?: PartManagerStore;
};

type State = {
  innerWidth: number;
  innerHeight: number;
};

function handleEvent(canvas: HTMLCanvasElement, { editorStore }: Props) {
  (canvas as any).onmousewheel = (e: MouseWheelEvent) => editorStore.performScroll(e.wheelDelta);
  canvas.onmousedown = e =>
    editorStore.performStart({
      x: e.x - canvas.width / 2,
      y: e.y - canvas.height / 2,
    });
  canvas.onmousemove = e =>
    editorStore.performUpdate({
      x: e.x - canvas.width / 2,
      y: e.y - canvas.height / 2,
    });
  canvas.onmouseup = e =>
    editorStore.performFinish({
      x: e.x - canvas.width / 2,
      y: e.y - canvas.height / 2,
    });
}

function render(canvas: HTMLCanvasElement, { partManagerStore, modelStore, editorStore }: Props) {
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
  editorStore.performRender(context);

  context.restore();
}

@inject('modelStore', 'editorStore', 'partManagerStore')
@observer
export class ModelRenderer extends Component<Props, State> {
  public state = {
    innerWidth,
    innerHeight,
  };

  public componentDidMount() {
    window.addEventListener('resize', this.invalidate);
  }

  public componentWillUnmount() {
    window.removeEventListener('resize', this.invalidate);
  }

  private invalidate = () => {
    this.setState({
      innerWidth,
      innerHeight,
    });
  };

  public render() {
    return (
      <canvas
        key={this.props.modelStore.invalidateKey + this.state.innerWidth + this.state.innerHeight}
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
