import { Lambda, observe } from 'mobx';
import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { Layer, Stage } from 'react-konva';
import { ModelStore } from '../../stores/ModelStore';
import { PartManagerStore } from '../../stores/PartManagerStore';
import { PatternGroup } from '../widget/PatternGroup';
import { PatternCheatSheet } from './CheatSheet';

type Props = {
  modelStore?: ModelStore;
  partManagerStore?: PartManagerStore;
};

type State = {
  width: number;
  height: number;
  shift: boolean;
};

@inject('modelStore', 'partManagerStore')
@observer
export class PatternRenderer extends React.Component<Props, State> {
  public state = {
    width: 0,
    height: 0,
    shift: false,
  };

  private ref: HTMLDivElement;
  private timerId: number;
  private disposer: Lambda;

  public componentDidMount() {
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('keydown', this.handleKeyboard);
    window.addEventListener('keyup', this.handleKeyboard);
    this.handleResize();
    this.disposer = observe(this.props.partManagerStore.downloadKey, () => {
      console.log('download');
    });
    setTimeout(() => this.updateCanvasSize(), 100); // @TODO
  }

  public componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('keydown', this.handleKeyboard);
    window.removeEventListener('keyup', this.handleKeyboard);
    this.disposer();
  }

  private handleRef = (ref: HTMLDivElement) => {
    if (!ref) return;
    this.ref = ref;
    this.updateCanvasSize();
  };

  private handleKeyboard = (e: KeyboardEvent) => {
    clearInterval(this.timerId);
    if (e.shiftKey) {
      this.timerId = window.setInterval(() => {
        const partStore = this.props.partManagerStore.activePartStore;
        if (!partStore) return;
        partStore.simulationStore.iterate();
      }, 5);
    }
    this.setState({
      shift: e.shiftKey,
    });
  };

  private updateCanvasSize() {
    const parent = this.ref.parentNode as HTMLElement;
    this.setState({
      width: parent.offsetWidth,
      height: parent.offsetHeight,
    });
  }

  private handleResize = () => {
    if (!this.ref) return;
    this.updateCanvasSize();
  };

  public render() {
    return (
      <div ref={this.handleRef}>
        <Stage width={this.state.width} height={this.state.height}>
          <Layer x={this.state.width / 2} y={this.state.height / 2}>
            {this.props.partManagerStore.activePartStore ? (
              <PatternGroup
                partStore={this.props.partManagerStore.activePartStore}
                scale={(Math.min(this.state.width, this.state.height) / this.props.partManagerStore.getMaxSize()) * 0.8}
              />
            ) : null}
          </Layer>
        </Stage>
        <PatternCheatSheet shift={this.state.shift} />
      </div>
    );
  }
}
