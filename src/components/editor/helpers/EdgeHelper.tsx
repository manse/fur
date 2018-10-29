import { observer } from 'mobx-react';
import * as React from 'react';
import { Line } from 'react-konva';
import { EdgeController } from '../controllers/EdgeController';

type Props = {
  edgeController: EdgeController;
};

export const EdgeHelper = observer(({ edgeController }: Props) => {
  const edge = edgeController.hoveredEdge;
  if (!edge) return null;
  return (
    <Line
      strokeWidth={3}
      stroke="rgba(255,128,0,0.5)"
      points={[edge.v0.projection.x, edge.v0.projection.y, edge.v1.projection.x, edge.v1.projection.y]}
    />
  );
});
