import { ReactNode } from 'react';
import './styles/Layout.pcss';

type Props = {
  children: ReactNode;
};

export const Layout = ({ children }: Props) => <div styleName="base">{children}</div>;
