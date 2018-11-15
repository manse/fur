import { saveAs } from 'file-saver';
import { autorun } from 'mobx';
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

  private divRef: HTMLDivElement;
  private stageRef: Stage;
  private timerId: number;
  private disposer: Function;
  private lastDownloadKey: number = 0;

  public componentDidMount() {
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('keydown', this.handleKeyboard);
    window.addEventListener('keyup', this.handleKeyboard);
    this.handleResize();
    this.disposer = autorun(() => {
      if (this.stageRef && this.lastDownloadKey && this.lastDownloadKey !== this.props.partManagerStore.downloadKey) {
        const canvas = this.stageRef
          .getStage()
          .getContent()
          .querySelector('canvas');
        canvas.toBlob(blob => saveAs(blob, `${new Date().toISOString()}.png`));
      }
      this.lastDownloadKey = this.props.partManagerStore.downloadKey;
    });
    setTimeout(() => this.updateCanvasSize(), 100); // @TODO
  }

  public componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('keydown', this.handleKeyboard);
    window.removeEventListener('keyup', this.handleKeyboard);
    this.disposer();
  }

  private handleDivRef = (ref: HTMLDivElement) => {
    if (!ref) return;
    this.divRef = ref;
    this.updateCanvasSize();
  };

  private handleStageRef = (stage: Stage) => {
    if (!stage) return;
    this.stageRef = stage;
  };

  private handleKeyboard = (e: KeyboardEvent) => {
    clearInterval(this.timerId);
    const partStore = this.props.partManagerStore.activePartStore;
    if (partStore) {
      if (e.shiftKey) {
        this.timerId = window.setInterval(() => partStore.simulationStore.iterate(), 5);
      }
    }
    this.setState({
      shift: e.shiftKey,
    });
  };

  private updateCanvasSize() {
    const parent = this.divRef.parentNode as HTMLElement;
    this.setState({
      width: parent.offsetWidth,
      height: parent.offsetHeight,
    });
  }

  private handleResize = () => {
    if (!this.divRef) return;
    this.updateCanvasSize();
  };

  public render() {
    return (
      <div ref={this.handleDivRef}>
        <Stage width={this.state.width} height={this.state.height} ref={this.handleStageRef}>
          <Layer x={this.state.width / 2} y={this.state.height / 2}>
            {this.props.partManagerStore.activePartStore ? (
              <PatternGroup
                partStore={this.props.partManagerStore.activePartStore}
                maxSize={Math.min(this.state.width, this.state.height) * 0.8}
              />
            ) : null}
          </Layer>
        </Stage>
        <PatternCheatSheet shift={this.state.shift} />
      </div>
    );
  }
}
