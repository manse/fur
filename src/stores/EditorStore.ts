import { observable } from 'mobx';
import stores from '.';

export enum EditorTab {
  model,
  pattern
}

export const EditorTabList = [EditorTab.model, EditorTab.pattern];

export class EditorStore {
  @observable
  public editorTab = EditorTab.model;

  constructor() {
    window.addEventListener('keydown', e => {
      if (this.editorTab === EditorTab.model) {
        stores.objectModelStore.handleKeyboard(e);
      }
    });
    window.addEventListener('keyup', e => {
      if (this.editorTab === EditorTab.model) {
        stores.objectModelStore.handleKeyboard(e);
      }
    });
  }

  public setEditorTab(editorTab: EditorTab) {
    this.editorTab = editorTab;
  }
}
