import { observer } from 'mobx-react';
import * as React from 'react';
import { Line } from 'react-konva';
import { FragmentController } from '../controllers/FragmentController';

type Props = {
  fragmentController: FragmentController;
};

export const FragmentHelper = observer(({ fragmentController }: Props) => {
  const fragment = fragmentController.hoveredFragment;
  if (!fragment) return null;
  return (
    <Line
      closed={true}
      fill="rgba(255,255,0,0.5)"
      points={[
        fragment.v0.projection.x,
        fragment.v0.projection.y,
        fragment.v1.projection.x,
        fragment.v1.projection.y,
        fragment.v2.projection.x,
        fragment.v2.projection.y,
      ]}
    />
  );
});
