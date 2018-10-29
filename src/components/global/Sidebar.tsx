import * as React from 'react';
import { PartList } from '../sidebar/PartList';
import { Toolbar } from '../sidebar/Toolbar';
import './styles/Sidebar.pcss';

export const Sidebar = () => (
  <div styleName="base">
    <PartList />
    <Toolbar />
  </div>
);
