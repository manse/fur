import { inject, observer } from 'mobx-react';
import { ControllerType } from '../stores/controllers/IController';
import { EditorStore, EditorTab } from '../stores/EditorStore';
import { ModelStore } from '../stores/ModelStore';
import './styles/CheatSheet.pcss';

type Props = {
  editorStore?: EditorStore;
  modelStore?: ModelStore;
};

export const CheatSheet = inject('editorStore', 'modelStore')(
  observer(({ editorStore, modelStore }: Props) => (
    <div styleName="base">
      <h1>fur</h1>
      {editorStore.editorTab === EditorTab.model ? (
        <div>
          <dl styleName={modelStore.controller.type === ControllerType.default ? 'active' : ''}>
            <dt>Click</dt>
            <dd>Move camera</dd>
          </dl>
          <dl styleName={modelStore.controller.type === ControllerType.fragment ? 'active' : ''}>
            <dt>Shift + Click</dt>
            <dd>Pick or unpick fragment</dd>
          </dl>
          <dl styleName={modelStore.controller.type === ControllerType.multipleFragment ? 'active' : ''}>
            <dt>Shift + A + Click</dt>
            <dd>Pick multiple fragment</dd>
          </dl>
          <dl>
            <dt>Shift + Z + Click</dt>
            <dd>Unpick multiple fragment</dd>
          </dl>
          <dl styleName={modelStore.controller.type === ControllerType.edge ? 'active' : ''}>
            <dt>Ctrl + Click</dt>
            <dd>Pick or unpick edge as darts</dd>
          </dl>
        </div>
      ) : null}
    </div>
  ))
);
