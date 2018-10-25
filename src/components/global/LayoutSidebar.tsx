import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { compose } from 'recompose';
import { PartManagerStore } from '../../stores/PartManagerStore';
import { PartList } from '../sidebar/PartList';
import { Toolbar } from '../sidebar/Toolbar';
import { IconButton } from '../widget/IconButton';
import './styles/LayoutSidebar.pcss';

type Props = {
  partManagerStore?: PartManagerStore;
};

export const LayoutSidebar = compose<Props, Props>(
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
      <PartList />
      <Toolbar
        leftItems={
          <React.Fragment>
            <IconButton icon="folder" onClick={noop} />
            <IconButton icon="plus" onClick={handleClickAddPart} />
            <IconButton icon="trash" disabled={!partManagerStore.activePartStore} onClick={handleClickDeletePart} />
          </React.Fragment>
        }
        rightItems={
          <React.Fragment>
            <IconButton icon="refresh" disabled={!partManagerStore.activePartStore} onClick={handleClickRegenerate} />
            <IconButton icon="download" disabled={!partManagerStore.activePartStore} onClick={handleClickSave} />
          </React.Fragment>
        }
      />
    </div>
  );
});
