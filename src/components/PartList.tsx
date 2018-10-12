import { inject, observer } from 'mobx-react';
import { ApplicationStore } from '../stores/ApplicationStore';
import { PartListItem } from './PartListItem';
import './styles/PartList.pcss';

type Props = {
  applicationStore?: ApplicationStore;
};

export const PartList = inject('applicationStore')(
  observer(({ applicationStore }: Props) => (
    <div styleName="base">
      {applicationStore.partStores.map(partStore => (
        <PartListItem
          partStore={partStore}
          active={partStore === applicationStore.activePartStore}
          key={partStore.id}
          onClick={() => applicationStore.setActivePartStore(partStore)}
        />
      ))}
    </div>
  ))
);
