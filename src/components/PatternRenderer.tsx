import { inject, observer } from 'mobx-react';
import { ModelStore } from '../stores/ModelStore';
import { PartManagerStore } from '../stores/PartManagerStore';

type Props = {
  modelStore?: ModelStore;
  partManagerStore?: PartManagerStore;
};

export const PatternRenderer = inject('modelStore', 'partManagerStore')(
  observer((props: Props) => {
    return <canvas key={props.modelStore.key} ref={canvas => canvas} />;
  })
);
