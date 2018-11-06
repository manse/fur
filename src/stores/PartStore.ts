import { hsv } from 'color-convert';
import { observable } from 'mobx';
import { EdgeStore } from './EdgeStore';
import { FragmentStore } from './FragmentStore';
import { SimulationStore } from './SimulationStore';

const hues = [
  ...Array.from({ length: 30 }).map((_, n) => n),
  ...Array.from({ length: 360 - 110 }).map((_, n) => n + 110),
];

export class PartStore {
  public readonly id = Math.random();
  public readonly color = `#${hsv.hex([hues[Math.floor(Math.random() * hues.length)], 80, 90])}`;

  @observable
  public fragmentStores: FragmentStore[] = [];
  @observable
  public edgeStores: EdgeStore[] = [];

  public simulationStore = new SimulationStore(this.fragmentStores, this.edgeStores);

  public includesFragmentStore(fragment: FragmentStore) {
    return this.fragmentStores.indexOf(fragment) !== -1;
  }

  public indexOfEdgeStore(edge: EdgeStore) {
    return this.edgeStores.findIndex(e => e.equals(edge));
  }

  public includesEdge(dart: EdgeStore) {
    return this.indexOfEdgeStore(dart) !== -1;
  }

  public addFragment(fragment: FragmentStore) {
    if (this.includesFragmentStore(fragment)) return;
    this.fragmentStores.push(fragment);
  }

  public removeFragment(fragment: FragmentStore) {
    const index = this.fragmentStores.indexOf(fragment);
    if (index >= 0) {
      this.fragmentStores.splice(index, 1);
    }
  }

  public addEdge(edge: EdgeStore) {
    if (this.includesEdge(edge)) return;
    this.edgeStores.push(edge);
  }

  public removeEdge(edge: EdgeStore) {
    const index = this.indexOfEdgeStore(edge);
    if (index === -1) return;
    this.edgeStores.splice(index, 1);
  }

  public refreshSimulation() {
    this.simulationStore.reset();
  }
}
