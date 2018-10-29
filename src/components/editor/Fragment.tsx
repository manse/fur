import { observer } from 'mobx-react';
import * as React from 'react';
import { Line } from 'react-konva';
import { FragmentStore } from '../../stores/FragmentStore';
import { PartManagerStore } from '../../stores/PartManagerStore';
import { toRGBA } from '../../utils/color';

type Props = {
  fragmentStore: FragmentStore;
  partManagerStore: PartManagerStore;
  color?: string;
};

export const Fragment = observer(({ partManagerStore, fragmentStore, color }: Props) => {
  const partStores = partManagerStore.filterPartStoresByFragment(fragmentStore);
  const clockwise = fragmentStore.isClockwise();
  let fill: string = color;
  if (!fill) {
    switch (partStores.length) {
      case 0:
        fill = null;
        break;
      case 1:
        fill = toRGBA(partStores[0].color, clockwise ? 0.4 : 0.1);
        break;
      default:
        fill = toRGBA('#333333', clockwise ? 0.4 : 0.1);
    }
  }
  return (
    <Line
      strokeWidth={0.15}
      stroke={clockwise ? 'black' : 'rgba(0,0,0,0.1)'}
      fill={color}
      closed={true}
      points={[
        fragmentStore.v0.projection.x,
        fragmentStore.v0.projection.y,
        fragmentStore.v1.projection.x,
        fragmentStore.v1.projection.y,
        fragmentStore.v2.projection.x,
        fragmentStore.v2.projection.y,
      ]}
    />
  );
});
