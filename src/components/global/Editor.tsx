import * as React from 'react';
import { ModelRenderer } from '../editor/ModelRenderer';
import { PatternRenderer } from '../editor/PatternRenderer';
import { SegmentedControl } from '../widget/SegmentedControl';
import './styles/Editor.pcss';

enum Tab {
  model,
  pattern,
}

const TabList = [Tab.model, Tab.pattern];

type State = {
  tab: Tab;
};

export class Editor extends React.Component<{}, State> {
  public state = {
    tab: Tab.model,
  };

  private handleClickItem = (i: number) => {
    this.setState({ tab: TabList[i] });
  };

  public render() {
    return (
      <div styleName="base">
        {this.state.tab === Tab.model ? <ModelRenderer /> : null}
        {this.state.tab === Tab.pattern ? <PatternRenderer /> : null}
        <h1 styleName="logo">fur</h1>
        <div styleName="display-switch">
          <SegmentedControl
            items={['Model', 'Pattern']}
            selectedIndex={TabList.indexOf(this.state.tab)}
            onClickItem={this.handleClickItem}
          />
        </div>
      </div>
    );
  }
}
