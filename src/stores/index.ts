import { sampleObj } from '../utils/sampleObj';
import { ObjectModelStore } from './ObjectModelStore';
import { PartManagerStore } from './PartManagerStore';
import { WindowStore } from './WindowStore';

const partManagerStore = new PartManagerStore();
const objectModelStore = new ObjectModelStore();
const windowStore = new WindowStore();
objectModelStore.loadModelFromObjString(sampleObj);

export default {
  partManagerStore,
  objectModelStore,
  windowStore
};
