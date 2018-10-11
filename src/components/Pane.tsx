import { ReactNode } from 'react';
import './styles/Pane.pcss';

type Props = {
  position: 'sidebar' | 'body';
  children: ReactNode;
};

export const Pane = ({ children, position }: Props) => <div styleName={`base ${position}`}>{children}</div>;
