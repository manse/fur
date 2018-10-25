import * as React from 'react';
import { PartList } from '../sidebar/PartList';
import { Toolbar } from '../sidebar/Toolbar';
import './styles/LayoutSidebar.pcss';

export const LayoutSidebar = () => (
  <div styleName="base">
    <PartList />
    <Toolbar />
  </div>
);
