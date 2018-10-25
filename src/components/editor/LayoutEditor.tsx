import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { compose } from 'recompose';
import { EditorStore, EditorTab, EditorTabList } from '../../stores/EditorStore';
import { SegmentedControl } from '../widget/SegmentedControl';
import { CheatSheet } from './CheatSheet';
import { ModelRenderer } from './ModelRenderer';
import { PatternRenderer } from './PatternRenderer';
import './styles/LayoutEditor.pcss';

type Props = {
  editorStore?: EditorStore;
};

export const LayoutEditor = compose<Props, Props>(
  inject('editorStore'),
  observer,
)(({ editorStore }) => {
  const handleClickItem = (i: number) => editorStore.setEditorTab(EditorTabList[i]);
  return (
    <div styleName="base">
      {editorStore.editorTab === EditorTab.model ? <ModelRenderer /> : null}
      {editorStore.editorTab === EditorTab.pattern ? <PatternRenderer /> : null}
      <CheatSheet />
      <div styleName="display-switch">
        <SegmentedControl
          items={['Model', 'Pattern']}
          selectedIndex={EditorTabList.indexOf(editorStore.editorTab)}
          onClickItem={handleClickItem}
        />
      </div>
    </div>
  );
});
