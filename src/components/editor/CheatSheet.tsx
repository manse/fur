import { BaseController } from './controllers/BaseController';
import { DefaultController } from './controllers/DefaultController';
import { EdgeController } from './controllers/EdgeController';
import { FragmentController } from './controllers/FragmentController';
import { AddMultiFragmentController, RemoveMultiFragmentController } from './controllers/MultiFragmentController';
import { ZoomController } from './controllers/ZoomController';
import './styles/CheatSheet.pcss';

type ControllerType = 'default' | 'fragment' | 'addMultiFragment' | 'removeMultiFragment' | 'edge' | 'zoom';

type Props = { controller: BaseController; onClickController: (controller: ControllerType) => void };

const METAKEY_LABEL = navigator.userAgent.indexOf('Macintosh') !== -1 ? 'Command' : 'Ctrl';

export const ModelCheatSheet = ({ controller, onClickController }: Props) => {
  const handleClickDefault = () => onClickController('default');
  const handleClickFragment = () => onClickController('fragment');
  const handleClickAddMultiFragment = () => onClickController('addMultiFragment');
  const handleClickRemoveMultiFragment = () => onClickController('removeMultiFragment');
  const handleClickZoom = () => onClickController('zoom');
  const handleClickEdge = () => onClickController('edge');
  return (
    <div styleName="base">
      <dl styleName={controller instanceof DefaultController ? 'active' : ''} onClick={handleClickDefault}>
        <dt>Click</dt>
        <dd>視点の移動</dd>
      </dl>
      <dl styleName={controller instanceof ZoomController ? 'active' : ''} onClick={handleClickZoom}>
        <dt>S + Click</dt>
        <dd>ズームイン・アウト</dd>
      </dl>
      <dl styleName={controller instanceof FragmentController ? 'active' : ''} onClick={handleClickFragment}>
        <dt>Shift + Click</dt>
        <dd>面の追加・削除</dd>
      </dl>
      <dl
        styleName={controller instanceof AddMultiFragmentController ? 'active' : ''}
        onClick={handleClickAddMultiFragment}
      >
        <dt>Shift + A + Click</dt>
        <dd>面をまとめて追加</dd>
      </dl>
      <dl
        styleName={controller instanceof RemoveMultiFragmentController ? 'active' : ''}
        onClick={handleClickRemoveMultiFragment}
      >
        <dt>Shift + Z + Click</dt>
        <dd>面をまとめて削除</dd>
      </dl>
      <dl styleName={controller instanceof EdgeController ? 'active' : ''} onClick={handleClickEdge}>
        <dt>{METAKEY_LABEL} + Click</dt>
        <dd>ダーツの追加・削除</dd>
      </dl>
    </div>
  );
};

export const PatternCheatSheet = ({ shift }: { shift: boolean }) => (
  <div styleName="base">
    <dl styleName={shift ? 'active' : ''}>
      <dt>Shift</dt>
      <dd>フラット化を進める</dd>
    </dl>
  </div>
);
