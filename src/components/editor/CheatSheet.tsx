import { inject, observer } from 'mobx-react';
import { compose } from 'recompose';
import { ControllerType, EditorStore, EditorTab } from '../../stores/EditorStore';
import './styles/CheatSheet.pcss';

type Props = {
  editorStore?: EditorStore;
};

export const CheatSheet = compose<Props, Props>(
  inject('editorStore'),
  observer,
)(({ editorStore }) => (
  <div styleName="base">
    <h1>fur</h1>
    {editorStore.editorTab === EditorTab.model ? (
      <div>
        <dl styleName={editorStore.controllerType === ControllerType.default ? 'active' : ''}>
          <dt>Click</dt>
          <dd>Move camera</dd>
        </dl>
        <dl styleName={editorStore.controllerType === ControllerType.fragment ? 'active' : ''}>
          <dt>Shift + Click</dt>
          <dd>Pick or unpick fragment</dd>
        </dl>
        <dl styleName={editorStore.controllerType === ControllerType.multipleFragmentAdd ? 'active' : ''}>
          <dt>Shift + A + Click</dt>
          <dd>Pick multiple fragment</dd>
        </dl>
        <dl styleName={editorStore.controllerType === ControllerType.multipleFragmentRemove ? 'active' : ''}>
          <dt>Shift + Z + Click</dt>
          <dd>Unpick multiple fragment</dd>
        </dl>
        <dl styleName={editorStore.controllerType === ControllerType.edge ? 'active' : ''}>
          <dt>Command + Click</dt>
          <dd>Pick or unpick edge as darts</dd>
        </dl>
      </div>
    ) : null}
  </div>
));
