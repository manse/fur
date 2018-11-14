import download from './images/download.inline.svg';
import folder from './images/folder.inline.svg';
import plus from './images/plus.inline.svg';
import trash from './images/trash.inline.svg';
import './styles/IconButton.pcss';

type Props = {
  icon: 'download' | 'folder' | 'plus' | 'trash';
  disabled?: boolean;
  onClick: () => any;
};

const icons = {
  download,
  folder,
  plus,
  trash,
};

export const IconButton = ({ icon, disabled, onClick }: Props) => {
  const Icon = (icons as any)[icon];
  return (
    <button styleName="base" onClick={onClick} disabled={disabled}>
      <Icon />
    </button>
  );
};
