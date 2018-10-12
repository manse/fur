import { PartStore } from '../stores/PartStore';
import './styles/PartListItem.pcss';

type Props = {
  partStore: PartStore;
  active: boolean;
  onClick: () => any;
};

export const PartListItem = ({ partStore, active, onClick }: Props) => (
  <div
    styleName={`base ${active ? 'active' : ''}`}
    style={{
      borderLeftColor: partStore.color
    }}
    onClick={onClick}
  >
    <canvas />
  </div>
);
