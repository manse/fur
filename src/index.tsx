import { observer, Provider } from 'mobx-react';
import { render } from 'react-dom';
import { Button } from './components/Button';
import { CheatSheet } from './components/CheatSheet';
import { Layout } from './components/Layout';
import { ModelRenderer } from './components/ModelRenderer';
import { Pane } from './components/Pane';
import { PartList } from './components/PartList';
import { PatternRenderer } from './components/PatternRenderer';
import { SegmentedControl } from './components/SegmentedControl';
import { Toolbar } from './components/Toolbar';
import stores from './stores';
import { EditorTab, EditorTabList } from './stores/EditorStore';
import './styles/app.pcss';

const App = observer(() => (
  <Provider {...stores}>
    <Layout>
      <Pane position="body">
        {stores.editorStore.editorTab === EditorTab.model ? <ModelRenderer /> : null}
        {stores.editorStore.editorTab === EditorTab.pattern ? <PatternRenderer /> : null}
        <CheatSheet />
        <div styleName="display-switch">
          <SegmentedControl
            items={['Model', 'Pattern']}
            selectedIndex={EditorTabList.indexOf(stores.editorStore.editorTab)}
            onClickItem={i => {
              stores.editorStore.setEditorTab(EditorTabList[i]);
            }}
          />
        </div>
      </Pane>
      <Pane position="sidebar">
        <PartList />
        <Toolbar
          leftItems={[
            <Button key={1} icon="folder" onClick={() => {}} />,
            <Button key={2} icon="plus" onClick={() => stores.partManagerStore.addPartStore()} />,
            <Button
              key={3}
              icon="trash"
              disabled={!stores.partManagerStore.activePartStore}
              onClick={() => stores.partManagerStore.removeActivePartStore()}
            />
          ]}
          rightItems={[
            <Button
              key={1}
              icon="refresh"
              disabled={!stores.partManagerStore.activePartStore}
              onClick={() => stores.partManagerStore.refreshActivePartStore()}
            />,
            <Button
              key={2}
              icon="download"
              disabled={!stores.partManagerStore.activePartStore}
              onClick={() => stores.partManagerStore.saveActivePartStoreAsImage()}
            />
          ]}
        />
      </Pane>
    </Layout>
  </Provider>
));

render(<App />, document.querySelector('#app'));
