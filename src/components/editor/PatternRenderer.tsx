import { inject, observer } from 'mobx-react';
import { compose } from 'recompose';
import { ModelStore } from '../../stores/ModelStore';
import { PartManagerStore } from '../../stores/PartManagerStore';

type Props = {
  modelStore?: ModelStore;
  partManagerStore?: PartManagerStore;
};

export const PatternRenderer = compose<Props, Props>(
  inject('modelStore', 'partManagerStore'),
  observer,
)(_ => <canvas ref={canvas => canvas} />);
