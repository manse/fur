import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { Layer, Stage } from 'react-konva';
import { ModelStore } from '../../stores/ModelStore';
import { PartManagerStore } from '../../stores/PartManagerStore';
import { PatternGroup } from '../widget/PatternGroup';

type Props = {
  modelStore?: ModelStore;
  partManagerStore?: PartManagerStore;
};

type State = {
  width: number;
  height: number;
};

@inject('modelStore', 'partManagerStore')
@observer
export class PatternRenderer extends React.Component<Props, State> {
  public state = {
    width: 0,
    height: 0,
  };

  private ref: HTMLDivElement;
  private timerId: number;

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
      }, 10);
    }
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
            <PatternGroup />
          </Layer>
        </Stage>
      </div>
    );
  }
}
