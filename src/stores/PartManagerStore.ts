import { observable } from 'mobx';
import { getPartColor } from '../utils/color';
import { FragmentStore } from './FragmentStore';
import { PartStore } from './PartStore';

export class PartManagerStore {
  @observable
  public partStores: PartStore[] = [];
  @observable
  public activePartStore: PartStore;

  public addPartStore() {
    const partStore = new PartStore();
    partStore.color = getPartColor(this.partStores.length * 0.45);
    this.partStores.push(partStore);
    if (this.partStores.length === 1) {
      this.activePartStore = partStore;
    }
  }

  public setActivePartStore(partStore: PartStore) {
    this.activePartStore = partStore;
  }

  public removeActivePartStore() {
    if (!this.activePartStore) return;
    const index = this.partStores.indexOf(this.activePartStore);
    this.partStores.splice(index, 1);
    this.activePartStore = this.partStores[index] || this.partStores[index - 1] || this.partStores[0] || undefined;
  }

  public refreshActivePartStore() {
    if (!this.activePartStore) return;
  }

  public saveActivePartStoreAsImage() {
    if (!this.activePartStore) return;
  }

  public filterPartStoresByFragment(fragment: FragmentStore) {
    return this.partStores.filter(part => part.includesFragmentStore(fragment));
  }
}
