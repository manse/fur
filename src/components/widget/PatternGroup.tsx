import { observer } from 'mobx-react';
import { Group, Line } from 'react-konva';
import { compose } from 'recompose';
import { PartStore } from '../../stores/PartStore';
import { toRGBA } from '../../utils/color';

type Props = {
  partStore: PartStore;
  size?: number;
  scale?: number;
};

export const PatternGroup = compose<Props, Props>(observer)(({ partStore, size, scale }: Props) => {
  const bounding = partStore.simulationStore.getBounding();
  const dx = bounding.max.x - bounding.min.x;
  const dy = bounding.max.y - bounding.min.y;
  const scaleXY = size ? size / Math.max(dx, dy) : scale || 100;
  return (
    <Group
      scale={{ x: scaleXY, y: scaleXY }}
      offsetX={(bounding.max.x + bounding.min.x) / 2}
      offsetY={(bounding.max.y + bounding.min.y) / 2}
    >
      {partStore.simulationStore.plates.map(plate => {
        return (
          <Line
            key={plate.key}
            fill={toRGBA(partStore.color, 0.4)}
            points={[
              plate.a0.vector.x,
              plate.a0.vector.y,
              plate.a1.vector.x,
              plate.a1.vector.y,
              plate.a2.vector.x,
              plate.a2.vector.y,
            ]}
            closed={true}
            strokeScaleEnabled={false}
            strokeWidth={0.3}
            stroke="white"
          />
        );
      })}
    </Group>
  );
});
