import { action, observable } from 'mobx';

export enum Tab {
  model,
  pattern,
}

const TabList = [Tab.model, Tab.pattern];

export class ApplicationStore {
  @observable
  public tab = Tab.model;

  @action
  public setTabIndex(index: number) {
    this.tab = TabList[index];
  }

  public get selectedTabIndex() {
    return TabList.indexOf(this.tab);
  }
}
