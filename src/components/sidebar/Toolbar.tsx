import { inject, observer } from 'mobx-react';
import { compose } from 'recompose';
import { PartManagerStore } from '../../stores/PartManagerStore';
import { IconButton } from '../widget/IconButton';
import './styles/Toolbar.pcss';

type Props = {
  partManagerStore?: PartManagerStore;
};

export const Toolbar = compose<Props, Props>(
  inject('partManagerStore'),
  observer,
)(({ partManagerStore }) => {
  const noop = () => {};
  const handleClickAddPart = () => partManagerStore.addPartStore();
  const handleClickDeletePart = () => partManagerStore.removeActivePartStore();
  const handleClickRegenerate = () => partManagerStore.refreshActivePartStore();
  const handleClickSave = () => partManagerStore.saveActivePartStoreAsImage();
  return (
    <div styleName="base">
      <div styleName="left">
        <IconButton icon="folder" onClick={noop} />
        <IconButton icon="plus" onClick={handleClickAddPart} />
        <IconButton icon="trash" disabled={!partManagerStore.activePartStore} onClick={handleClickDeletePart} />
      </div>
      <div styleName="right">
        <IconButton icon="refresh" disabled={!partManagerStore.activePartStore} onClick={handleClickRegenerate} />
        <IconButton icon="download" disabled={!partManagerStore.activePartStore} onClick={handleClickSave} />
      </div>
    </div>
  );
});
