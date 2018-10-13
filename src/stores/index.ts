import { sampleObj } from '../utils/sampleObj';
import { EditorStore } from './EditorStore';
import { ObjectModelStore } from './ObjectModelStore';
import { PartManagerStore } from './PartManagerStore';
import { WindowStore } from './WindowStore';

const partManagerStore = new PartManagerStore();
const objectModelStore = new ObjectModelStore();
const editorStore = new EditorStore();
const windowStore = new WindowStore();
objectModelStore.loadModelFromObjString(sampleObj);
partManagerStore.addPartStore();

export default {
  partManagerStore,
  objectModelStore,
  editorStore,
  windowStore
};
