import { inject, observer } from 'mobx-react';
import { compose } from 'recompose';
import { ApplicationStore, Tab } from '../../stores/ApplicationStore';
import { PartManagerStore } from '../../stores/PartManagerStore';
import { IconButton } from '../widget/IconButton';
import './styles/Toolbar.pcss';

type Props = {
  partManagerStore?: PartManagerStore;
  applicationStore?: ApplicationStore;
};

export const Toolbar = compose<Props, Props>(
  inject('partManagerStore', 'applicationStore'),
  observer,
)(({ partManagerStore, applicationStore }) => {
  const noop = () => {};
  const handleClickAddPart = () => partManagerStore.addPartStore();
  const handleClickDeletePart = () => partManagerStore.removeActivePartStore();
  const handleClickSave = () => partManagerStore.saveActivePartStoreAsImage();
  return (
    <div styleName="base">
      <div styleName="left">
        <IconButton icon="folder" onClick={noop} />
        <IconButton icon="plus" onClick={handleClickAddPart} />
        <IconButton icon="trash" disabled={!partManagerStore.activePartStore} onClick={handleClickDeletePart} />
      </div>
      <div styleName="right">
        <IconButton
          icon="download"
          disabled={!partManagerStore.activePartStore || applicationStore.tab !== Tab.pattern}
          onClick={handleClickSave}
        />
      </div>
    </div>
  );
});
