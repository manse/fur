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
)(
  ({ partManagerStore: { activePartStore } }) =>
    activePartStore ? (
      <Group scale={{ x: 100, y: 100 }}>
        {activePartStore.simulationStore.springStores.map(spring => {
          return (
            <Line
              key={spring.id}
              points={[spring.a0.x, spring.a0.y, spring.a1.x, spring.a1.y]}
              closed={true}
              strokeScaleEnabled={false}
              strokeWidth={0.3}
              stroke="black"
            />
          );
        })}
      </Group>
    ) : (
      <Group />
    ),
);
