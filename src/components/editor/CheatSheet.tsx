import { BaseController } from './controllers/BaseController';
import { DefaultController } from './controllers/DefaultController';
import { EdgeController } from './controllers/EdgeController';
import { FragmentController } from './controllers/FragmentController';
import { AddMultiFragmentController, RemoveMultiFragmentController } from './controllers/MultiFragmentController';
import './styles/CheatSheet.pcss';

export const ModelCheatSheet = ({ controller }: { controller: BaseController }) => (
  <div styleName="base">
    <dl styleName={controller instanceof DefaultController ? 'active' : ''}>
      <dt>Click</dt>
      <dd>視点の移動</dd>
    </dl>
    <dl styleName={controller instanceof FragmentController ? 'active' : ''}>
      <dt>Shift + Click</dt>
      <dd>面の追加・削除</dd>
    </dl>
    <dl styleName={controller instanceof AddMultiFragmentController ? 'active' : ''}>
      <dt>Shift + A + Click</dt>
      <dd>面をまとめて追加</dd>
    </dl>
    <dl styleName={controller instanceof RemoveMultiFragmentController ? 'active' : ''}>
      <dt>Shift + Z + Click</dt>
      <dd>面をまとめて削除</dd>
    </dl>
    <dl styleName={controller instanceof EdgeController ? 'active' : ''}>
      <dt>Command + Click</dt>
      <dd>ダーツの追加・削除</dd>
    </dl>
  </div>
);

export const PatternCheatSheet = ({ shift }: { shift: boolean }) => (
  <div styleName="base">
    <dl styleName={shift ? 'active' : ''}>
      <dt>Shift</dt>
      <dd>フラット化を進める</dd>
    </dl>
  </div>
);
