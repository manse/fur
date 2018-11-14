import { Provider } from 'mobx-react';
import * as React from 'react';
import { render } from 'react-dom';
import { Editor } from './components/editor/Editor';
import { Sidebar } from './components/sidebar/Sidebar';
import stores from './stores';
import './styles/app.pcss';

const App = () => (
  <Provider {...stores}>
    <React.Fragment>
      <Editor />
      <Sidebar />
    </React.Fragment>
  </Provider>
);

render(<App />, document.querySelector('#app'));
