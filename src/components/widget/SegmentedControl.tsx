import './styles/SegmentedControl.pcss';

type Props = {
  items: string[];
  selectedIndex: number;
  onClickItem: (i: number) => any;
};

export const SegmentedControl = ({ items, selectedIndex, onClickItem }: Props) => (
  <div styleName="base">
    {items.map((item, index) => {
      const handleClickItem = () => onClickItem(index);
      return (
        <div key={item} styleName={`item ${selectedIndex === index ? 'active' : ''}`} onClick={handleClickItem}>
          {item}
        </div>
      );
    })}
  </div>
);
