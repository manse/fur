import { inject, observer } from 'mobx-react';
import { PartManagerStore } from '../stores/PartManagerStore';
import { PartListItem } from './PartListItem';
import './styles/PartList.pcss';

type Props = {
  partManagerStore?: PartManagerStore;
};

export const PartList = inject('partManagerStore')(
  observer(({ partManagerStore }: Props) => (
    <div styleName="base">
      {partManagerStore.partStores.map(partStore => (
        <PartListItem
          partStore={partStore}
          active={partStore === partManagerStore.activePartStore}
          key={partStore.id}
          onClick={() => partManagerStore.setActivePartStore(partStore)}
        />
      ))}
    </div>
  ))
);
