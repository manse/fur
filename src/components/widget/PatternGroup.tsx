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
      <Group>
        {activePartStore.simulationStore.plateStores.map((plate, i) => {
          return (
            <Line
              key={Math.random()}
              points={plate.globalCoordinates.reduce((acc, { x, y }) => [...acc, x * 60, y * 60], [])}
              closed={true}
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
