import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { compose } from 'recompose';
import { ApplicationStore, Tab } from '../../stores/ApplicationStore';
import { SegmentedControl } from '../widget/SegmentedControl';
import { ModelRenderer } from './ModelRenderer';
import { PatternRenderer } from './PatternRenderer';
import './styles/Editor.pcss';

type Props = {
  applicationStore?: ApplicationStore;
};

export const Editor = compose<Props, Props>(
  inject('applicationStore'),
  observer,
)(({ applicationStore }) => {
  const handleClickItem = (i: number) => applicationStore.setTabIndex(i);

  return (
    <div styleName="base">
      {applicationStore.tab === Tab.model ? <ModelRenderer /> : null}
      {applicationStore.tab === Tab.pattern ? <PatternRenderer /> : null}
      <h1 styleName="logo">fur</h1>
      <div styleName="display-switch">
        <SegmentedControl
          items={['モデル', 'パターン']}
          selectedIndex={applicationStore.selectedTabIndex}
          onClickItem={handleClickItem}
        />
      </div>
    </div>
  );
});
