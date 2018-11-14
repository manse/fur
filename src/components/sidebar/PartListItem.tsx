import { inject, observer } from 'mobx-react';
import { Layer, Stage } from 'react-konva';
import { compose } from 'recompose';
import { PartManagerStore } from '../../stores/PartManagerStore';
import { PartStore } from '../../stores/PartStore';
import { PatternGroup } from '../widget/PatternGroup';
import './styles/PartListItem.pcss';

type Props = {
  partManagerStore?: PartManagerStore;
  partStore: PartStore;
  active: boolean;
  onClick: () => any;
};

export const PartListItem = compose<Props, Props>(
  inject('partManagerStore'),
  observer,
)(({ partManagerStore, partStore, active, onClick }) => (
  <div styleName={`base ${active ? 'active' : ''}`} onClick={onClick}>
    <div styleName="color" style={{ borderTopColor: partStore.color }} />
    <Stage width={300} height={300}>
      <Layer x={150} y={150}>
        <PatternGroup partStore={partStore} size={250} />
      </Layer>
    </Stage>
  </div>
));
