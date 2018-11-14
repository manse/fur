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
)(({ partStore, active, onClick }) => (
  <div styleName={`base ${active ? 'active' : ''}`} onClick={onClick}>
    <div styleName="color" style={{ borderTopColor: partStore.color }} />
    <Stage width={240} height={240}>
      <Layer x={120} y={120}>
        <PatternGroup partStore={partStore} size={160} />
      </Layer>
    </Stage>
  </div>
));
