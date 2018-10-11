import { Provider } from 'mobx-react';
import { render } from 'react-dom';
import { Button } from './components/Button';
import { Layout } from './components/Layout';
import { Pane } from './components/Pane';
import { PartList } from './components/PartList';
import { SegmentedControl } from './components/SegmentedControl';
import { Toolbar } from './components/Toolbar';
import stores from './stores';
import './styles/app.pcss';

const App = () => (
  <Provider {...stores}>
    <Layout>
      <Pane position="sidebar">
        <PartList />
        <Toolbar
          leftItems={[<Button icon="folder" />, <Button icon="plus" />, <Button icon="trash" />]}
          rightItems={[<Button icon="refresh" />, <Button icon="download" />]}
        />
      </Pane>
      <Pane position="body">
        <div styleName="display-switch">
          <SegmentedControl items={['Model', 'Pattern']} selectedIndex={0} onClickItem={() => {}} />
        </div>
      </Pane>
    </Layout>
  </Provider>
);

render(<App />, document.querySelector('#app'));
