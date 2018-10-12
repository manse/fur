import { observer, Provider } from 'mobx-react';
import { render } from 'react-dom';
import { Button } from './components/Button';
import { Layout } from './components/Layout';
import { Pane } from './components/Pane';
import { PartList } from './components/PartList';
import { SegmentedControl } from './components/SegmentedControl';
import { Toolbar } from './components/Toolbar';
import stores from './stores';
import './styles/app.pcss';

const App = observer(() => (
  <Provider {...stores}>
    <Layout>
      <Pane position="sidebar">
        <PartList />
        <Toolbar
          leftItems={[
            <Button key={1} icon="folder" onClick={() => {}} />,
            <Button key={2} icon="plus" onClick={() => stores.applicationStore.addPartStore()} />,
            <Button
              key={3}
              icon="trash"
              disabled={!stores.applicationStore.activePartStore}
              onClick={() => stores.applicationStore.removeActivePartStore()}
            />
          ]}
          rightItems={[
            <Button
              key={1}
              icon="refresh"
              disabled={!stores.applicationStore.activePartStore}
              onClick={() => stores.applicationStore.refreshActivePartStore()}
            />,
            <Button
              key={2}
              icon="download"
              disabled={!stores.applicationStore.activePartStore}
              onClick={() => stores.applicationStore.saveActivePartStoreAsImage()}
            />
          ]}
        />
      </Pane>
      <Pane position="body">
        <div styleName="display-switch">
          <SegmentedControl items={['Model', 'Pattern']} selectedIndex={0} onClickItem={() => {}} />
        </div>
      </Pane>
    </Layout>
  </Provider>
));

render(<App />, document.querySelector('#app'));
