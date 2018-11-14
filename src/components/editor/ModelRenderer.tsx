import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { Layer, Line, Stage } from 'react-konva';
import { EdgeStore } from '../../stores/EdgeStore';
import { ModelStore } from '../../stores/ModelStore';
import { PartManagerStore } from '../../stores/PartManagerStore';
import { ligten, toRGBA } from '../../utils/color';
import { Point2D } from '../../utils/vo';
import { ModelCheatSheet } from './CheatSheet';
import { BaseController } from './controllers/BaseController';
import { DefaultController } from './controllers/DefaultController';
import { EdgeController } from './controllers/EdgeController';
import { FragmentController } from './controllers/FragmentController';
import { AddMultiFragmentController, BaseMultiFragmentController, RemoveMultiFragmentController } from './controllers/MultiFragmentController';
import { EdgeHelper } from './helpers/EdgeHelper';
import { FragmentHelper } from './helpers/FragmentHelper';
import { MultiFragmentHelper } from './helpers/MultiFragmentHelper';

type Props = {
  modelStore?: ModelStore;
  partManagerStore?: PartManagerStore;
};

type State = {
  width: number;
  height: number;
  controllerId: number;
};

@inject('modelStore', 'partManagerStore')
@observer
export class ModelRenderer extends React.Component<Props, State> {
  public state = {
    width: 0,
    height: 0,
    controllerId: 0,
  };
  private keyConfig = {
    shift: false,
    ctrl: false,
    key: '',
  };
  private ref: HTMLDivElement;
  private dragging = false;
  private stores = {
    modelStore: this.props.modelStore,
    partManagerStore: this.props.partManagerStore,
  };
  private defaultController = new DefaultController(this.stores);
  private edgeController = new EdgeController(this.stores);
  private fragmentController = new FragmentController(this.stores);
  private addMultiFragmentController = new AddMultiFragmentController(this.stores);
  private removeMultiFragmentController = new RemoveMultiFragmentController(this.stores);
  private controller: BaseController = this.defaultController;

  public componentDidMount() {
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('keydown', this.handleKeyboard);
    window.addEventListener('keyup', this.handleKeyboard);
    this.handleResize();
    setTimeout(() => this.updateCanvasSize(), 100); // @TODO
  }

  public componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('keydown', this.handleKeyboard);
    window.removeEventListener('keyup', this.handleKeyboard);
  }

  private updateCanvasSize() {
    const parent = this.ref.parentNode as HTMLElement;
    this.setState({
      width: parent.offsetWidth,
      height: parent.offsetHeight,
    });
  }

  private updateController() {
    let controller: BaseController;
    if (this.keyConfig.key === 'A') {
      controller = this.addMultiFragmentController;
    } else if (this.keyConfig.key === 'Z') {
      controller = this.removeMultiFragmentController;
    } else if (this.keyConfig.shift) {
      controller = this.fragmentController;
    } else if (this.keyConfig.ctrl) {
      controller = this.edgeController;
    } else {
      controller = this.defaultController;
    }
    if (controller !== this.controller) {
      this.controller = controller;
      this.setState({
        controllerId: this.state.controllerId + 1,
      });
    }
  }

  private handleResize = () => {
    if (!this.ref) return;
    this.updateCanvasSize();
  };

  private handleRef = (ref: HTMLDivElement) => {
    if (!ref) return;
    (ref as any).onmousewheel = this.handleMousewheel;
    ref.onmousedown = this.handleMousedown;
    ref.onmousemove = this.handleMousemove;
    this.ref = ref;
    this.updateCanvasSize();
  };

  private handleKeyboard = (e: KeyboardEvent) => {
    const config = {
      shift: e.shiftKey,
      ctrl: e.metaKey || e.ctrlKey,
      key: e.type === 'keyup' ? '' : String.fromCharCode(e.which),
    };
    this.keyConfig = config;
    if (!this.dragging) {
      this.updateController();
    }
  };

  private handleMousewheel = (e: MouseWheelEvent) => {
    this.controller.scroll(e.wheelDelta);
  };

  private handleMousedown = (e: MouseEvent) => {
    this.dragging = true;
    const { move, end } = this.controller.drag(this.transformPointToProjection(e));
    const mousemove = (e: MouseEvent) => move(this.transformPointToProjection(e));
    const mouseup = (e: MouseEvent) => {
      end(this.transformPointToProjection(e));
      window.removeEventListener('mousemove', mousemove);
      window.removeEventListener('mouseup', mouseup);
      this.updateController();
      this.dragging = false;
    };
    window.addEventListener('mousemove', mousemove);
    window.addEventListener('mouseup', mouseup);
  };

  private handleMousemove = (e: MouseEvent) => {
    this.controller.hover(this.transformPointToProjection(e));
  };

  private transformPointToProjection({ x, y }: Point2D) {
    return {
      x: x - this.state.width / 2,
      y: y - this.state.height / 2,
    };
  }

  public render() {
    const clockwiseEdges: EdgeStore[] = [];
    const fragments = this.props.modelStore.fragmentStores.map((fragment, i) => {
      const partStores = this.props.partManagerStore.filterPartStoresByFragment(fragment);
      const active = partStores.some(partStore => this.props.partManagerStore.activePartStore === partStore);
      const clockwise = fragment.isClockwise();
      if (clockwise) {
        clockwiseEdges.push(...fragment.edgeStores);
      }
      const opacity = (clockwise ? 0.6 : 0.1) * (active ? 1 : 0.25);
      let color: string = null;
      switch (partStores.length) {
        case 0:
          color = null;
          break;
        case 1:
          color = toRGBA(partStores[0].color, opacity);
          break;
        default:
          color = toRGBA('#aaaaaa', opacity);
      }
      return (
        <Line
          key={i}
          strokeWidth={0.15}
          stroke={clockwise ? 'white' : 'rgba(255,255,255,0.2)'}
          fill={color}
          closed={true}
          points={[
            fragment.v0.projection.x,
            fragment.v0.projection.y,
            fragment.v1.projection.x,
            fragment.v1.projection.y,
            fragment.v2.projection.x,
            fragment.v2.projection.y,
          ]}
        />
      );
    });
    const edges = this.props.partManagerStore.partStores.reduce(
      (acc, partStore, i) => [
        ...acc,
        ...partStore.edgeStores.map((edge, j) => (
          <Line
            key={i * 10000 + j}
            strokeWidth={3}
            stroke={toRGBA(ligten(partStore.color, 2), clockwiseEdges.find(e => edge.equals(e)) ? 1 : 0.1)}
            points={[edge.v0.projection.x, edge.v0.projection.y, edge.v1.projection.x, edge.v1.projection.y]}
          />
        )),
      ],
      [],
    );
    let helper: React.ReactNode;
    if (this.controller instanceof FragmentController) {
      helper = <FragmentHelper fragmentController={this.controller} />;
    } else if (this.controller instanceof EdgeController) {
      helper = <EdgeHelper edgeController={this.controller} />;
    } else if (this.controller instanceof BaseMultiFragmentController) {
      helper = <MultiFragmentHelper multiFragmentController={this.controller} />;
    }

    return (
      <div ref={this.handleRef}>
        <ModelCheatSheet controller={this.controller} key={this.state.controllerId} />
        <Stage width={this.state.width} height={this.state.height}>
          <Layer x={this.state.width / 2} y={this.state.height / 2}>
            {fragments}
            {edges}
            {helper}
          </Layer>
        </Stage>
      </div>
    );
  }
}
