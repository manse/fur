import { inject, observer } from 'mobx-react';
import { compose } from 'recompose';
import { ApplicationStore, Tab } from '../../stores/ApplicationStore';
import { ModelStore } from '../../stores/ModelStore';
import { PartManagerStore } from '../../stores/PartManagerStore';
import { IconButton } from '../widget/IconButton';
import './styles/Toolbar.pcss';

type Props = {
  partManagerStore?: PartManagerStore;
  modelStore?: ModelStore;
  applicationStore?: ApplicationStore;
};

export const Toolbar = compose<Props, Props>(
  inject('partManagerStore', 'applicationStore'),
  observer,
)(({ partManagerStore, modelStore, applicationStore }) => {
  const handleOpen = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt, text/plain';
    input.onchange = event => {
      const file = (event.target as any).files[0];
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = () => modelStore.loadModelFromObjString(reader.result.toString());
    };
    input.click();
  };
  const handleClickAddPart = () => partManagerStore.addPartStore();
  const handleClickDeletePart = () => partManagerStore.removeActivePartStore();
  const handleClickSave = () => partManagerStore.saveActivePartStoreAsImage();
  return (
    <div styleName="base">
      <div styleName="left">
        <IconButton icon="folder" onClick={handleOpen} />
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
