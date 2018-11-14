import { inject, observer } from 'mobx-react';
import { Group, Line } from 'react-konva';
import { compose } from 'recompose';
import { PartManagerStore } from '../../stores/PartManagerStore';

type Props = {
  partManagerStore?: PartManagerStore;
};

export const PatternGroup = compose<Props, Props>(
  inject('partManagerStore'),
  observer,
)(({ partManagerStore: { activePartStore } }) => {
  if (!activePartStore) return <Group />;
  return (
    <Group scale={{ x: 100, y: 100 }}>
      {activePartStore.simulationStore.plates.map(plate => {
        return (
          <Line
            key={plate.key}
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
