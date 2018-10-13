import { inject, observer } from 'mobx-react';
import { SIDEBAR_WIDTH } from '../constrants/Layout';
import { ObjectModelStore } from '../stores/ObjectModelStore';
import { PartManagerStore } from '../stores/PartManagerStore';
import { WindowStore } from '../stores/WindowStore';

type Props = {
  windowStore?: WindowStore;
  objectModelStore?: ObjectModelStore;
  partManagerStore?: PartManagerStore;
};

export const PatternRenderer = inject('windowStore', 'objectModelStore', 'partManagerStore')(
  observer((props: Props) => {
    return (
      <canvas
        key={props.objectModelStore.key}
        width={props.windowStore.width - SIDEBAR_WIDTH}
        height={props.windowStore.height}
        ref={canvas => canvas}
      />
    );
  })
);
