import { sampleObj } from '../utils/sampleObj';
import { ApplicationStore } from './ApplicationStore';
import { ModelStore } from './ModelStore';
import { PartManagerStore } from './PartManagerStore';

const partManagerStore = new PartManagerStore();
const modelStore = new ModelStore();
const applicationStore = new ApplicationStore();
modelStore.loadModelFromObjString(sampleObj);
partManagerStore.addPartStore();

export default {
  applicationStore,
  partManagerStore,
  modelStore,
};
