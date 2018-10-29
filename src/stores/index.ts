import { sampleObj } from '../utils/sampleObj';
import { ModelStore } from './ModelStore';
import { PartManagerStore } from './PartManagerStore';

const partManagerStore = new PartManagerStore();
const modelStore = new ModelStore();
modelStore.loadModelFromObjString(sampleObj);
partManagerStore.addPartStore();

export default {
  partManagerStore,
  modelStore,
};
