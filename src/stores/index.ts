import { sampleObj } from '../utils/sampleObj';
import { ApplicationStore } from './ApplicationStore';
import { ModelStore } from './ModelStore';
import { PartManagerStore } from './PartManagerStore';

const partManagerStore = new PartManagerStore();
const modelStore = new ModelStore();
const applicationStore = new ApplicationStore();
modelStore.loadModelFromObjString(sampleObj);

// prettier-ignore
[100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99]
  .forEach(i => partManagerStore.activePartStore.addFragment(modelStore.fragmentStores[i]));
[[19, 1], [21, 0], [2, 0], [4, 0]].forEach(([fragIndex, edgeIndex]) =>
  partManagerStore.activePartStore.addEdge(
    partManagerStore.activePartStore.fragmentStores[fragIndex].edgeStores[edgeIndex],
  ),
);
partManagerStore.addPartStore();

export default {
  applicationStore,
  partManagerStore,
  modelStore,
};
