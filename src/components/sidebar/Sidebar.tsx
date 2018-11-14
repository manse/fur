import * as React from 'react';
import { PartList } from './PartList';
import './styles/Sidebar.pcss';
import { Toolbar } from './Toolbar';

export const Sidebar = () => (
  <div styleName="base">
    <PartList />
    <Toolbar />
  </div>
);
