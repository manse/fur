import { ReactNode } from 'react';
import './styles/Toolbar.pcss';

type Props = {
  leftItems: ReactNode;
  rightItems: ReactNode;
};

export const Toolbar = ({ leftItems, rightItems }: Props) => (
  <div styleName="base">
    <div styleName="left">{leftItems}</div>
    <div styleName="right">{rightItems}</div>
  </div>
);
