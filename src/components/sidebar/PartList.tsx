import { inject, observer } from 'mobx-react';
import { compose } from 'recompose';
import { PartManagerStore } from '../../stores/PartManagerStore';
import { PartListItem } from './PartListItem';
import './styles/PartList.pcss';

type Props = {
  partManagerStore?: PartManagerStore;
};

export const PartList = compose<Props, Props>(
  inject('partManagerStore'),
  observer,
)(({ partManagerStore }) => (
  <div styleName="base">
    {partManagerStore.partStores.map(partStore => {
      const handleClick = () => partManagerStore.setActivePartStore(partStore);
      return (
        <PartListItem
          partStore={partStore}
          active={partStore === partManagerStore.activePartStore}
          key={partStore.id}
          onClick={handleClick}
        />
      );
    })}
  </div>
));
