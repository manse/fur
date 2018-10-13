import { sampleObj } from '../utils/sampleObj';
import { EditorStore } from './EditorStore';
import { ModelStore } from './ModelStore';
import { PartManagerStore } from './PartManagerStore';

const partManagerStore = new PartManagerStore();
const modelStore = new ModelStore({
  partManagerStore
});
const editorStore = new EditorStore({
  modelStore
});
modelStore.loadModelFromObjString(sampleObj);
partManagerStore.addPartStore();

export default {
  partManagerStore,
  modelStore,
  editorStore
};
