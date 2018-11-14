import { action, observable } from 'mobx';
import { getPartColor } from '../utils/color';
import { FragmentStore } from './FragmentStore';
import { PartStore } from './PartStore';

export class PartManagerStore {
  @observable
  public partStores: PartStore[] = [];
  @observable
  public activePartStore: PartStore;
  @observable
  public downloadKey = Math.random();

  @action
  public clear() {
    this.partStores = [];
  }

  @action
  public addPartStore() {
    const partStore = new PartStore();
    partStore.color = getPartColor(this.partStores.length * 0.45);
    this.partStores.push(partStore);
    if (this.partStores.length === 1) {
      this.activePartStore = partStore;
    }
  }

  @action
  public setActivePartStore(partStore: PartStore) {
    this.activePartStore = partStore;
  }

  @action
  public removeActivePartStore() {
    if (!this.activePartStore) return;
    const index = this.partStores.indexOf(this.activePartStore);
    this.partStores.splice(index, 1);
    this.activePartStore = this.partStores[index] || this.partStores[index - 1] || this.partStores[0] || undefined;
  }

  @action
  public saveActivePartStoreAsImage() {
    if (!this.activePartStore) return;
    this.downloadKey = Math.random();
  }

  public filterPartStoresByFragment(fragment: FragmentStore) {
    return this.partStores.filter(part => part.includesFragmentStore(fragment));
  }

  public getMaxSize() {
    return Math.max(
      ...this.partStores.reduce<number[]>((acc, store) => {
        const bounding = store.simulationStore.getBounding();
        return [...acc, bounding.max.x - bounding.min.x, bounding.max.y - bounding.min.y];
      }, []),
    );
  }
}
