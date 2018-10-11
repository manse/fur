import './styles/SegmentedControl.pcss';

type Props = {
  items: string[];
  selectedIndex: number;
  onClickItem: (i: number) => any;
};

export const SegmentedControl = ({ items, selectedIndex }: Props) => (
  <div styleName="base">
    {items.map((item, index) => (
      <div styleName={`item ${selectedIndex === index ? 'active' : ''}`}>{item}</div>
    ))}
  </div>
);
