import download from './images/download.inline.svg';
import folder from './images/folder.inline.svg';
import plus from './images/plus.inline.svg';
import refresh from './images/refresh.inline.svg';
import trash from './images/trash.inline.svg';
import './styles/Button.pcss';

type Props = {
  icon: 'download' | 'folder' | 'plus' | 'refresh' | 'trash';
};

const icons = {
  download,
  folder,
  plus,
  refresh,
  trash
};

export const Button = ({ icon }: Props) => {
  const Icon = (icons as any)[icon];
  return (
    <button styleName="base">
      <Icon />
    </button>
  );
};
