import { hsv } from 'color-convert';
import { observable } from 'mobx';
import { EdgeStore } from './EdgeStore';
import { FragmentStore } from './FragmentStore';

const hues = [
  ...Array.from({ length: 30 }).map((_, n) => n),
  ...Array.from({ length: 360 - 110 }).map((_, n) => n + 110)
];

export class PartStore {
  public id = Math.random();
  public color = '#' + hsv.hex([hues[Math.floor(Math.random() * hues.length)], 80, 90]);

  @observable
  public fragmentStores: FragmentStore[] = [];
  @observable
  public edgeStores: EdgeStore[] = [];
}
