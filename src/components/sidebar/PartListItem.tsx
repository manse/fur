import { observer } from 'mobx-react';
import { Layer, Stage } from 'react-konva';
import { PartStore } from '../../stores/PartStore';
import { PatternGroup } from '../widget/PatternGroup';
import './styles/PartListItem.pcss';

type Props = {
  partStore: PartStore;
  active: boolean;
  onClick: () => any;
};

export const PartListItem = observer(({ partStore, active, onClick }: Props) => (
  <div styleName={`base ${active ? 'active' : ''}`} onClick={onClick}>
    <div styleName="color" style={{ borderTopColor: partStore.color }} />
    <Stage width={300} height={300}>
      <Layer x={150} y={150}>
        <PatternGroup partStore={partStore} size={300 * 0.7} />
      </Layer>
    </Stage>
  </div>
));
