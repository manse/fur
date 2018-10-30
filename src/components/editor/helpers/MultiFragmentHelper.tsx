import { observer } from 'mobx-react';
import * as React from 'react';
import { Group, Rect } from 'react-konva';
import { BaseMultiFragmentController } from '../controllers/MultiFragmentController';

type Props = {
  multiFragmentController: BaseMultiFragmentController;
};

export const MultiFragmentHelper = observer(({ multiFragmentController }: Props) => {
  const startPoint = multiFragmentController.startPoint;
  const endPoint = multiFragmentController.endPoint;
  if (!startPoint || !endPoint) return null;
  const x = Math.min(startPoint.x, endPoint.x);
  const y = Math.min(startPoint.y, endPoint.y);
  const width = Math.abs(startPoint.x - endPoint.x);
  const height = Math.abs(startPoint.y - endPoint.y);
  return (
    <Group>
      <Rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={'rgba(255,255,0,0.2)'}
        stroke={'rgba(255,128,0,0.5)'}
        strokeWidth={2}
      />
    </Group>
  );
});
