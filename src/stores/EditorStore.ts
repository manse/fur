import { observable } from 'mobx';
import { ModelStore } from './ModelStore';

export enum EditorTab {
  model,
  pattern
}

export const EditorTabList = [EditorTab.model, EditorTab.pattern];

export class EditorStore {
  @observable
  public editorTab = EditorTab.model;

  constructor({ modelStore }: { modelStore: ModelStore }) {
    window.addEventListener('keydown', e => {
      if (this.editorTab === EditorTab.model) {
        modelStore.handleKeyboard(e);
      }
    });
    window.addEventListener('keyup', e => {
      if (this.editorTab === EditorTab.model) {
        modelStore.handleKeyboard(e);
      }
    });
  }

  public setEditorTab(editorTab: EditorTab) {
    this.editorTab = editorTab;
  }
}
