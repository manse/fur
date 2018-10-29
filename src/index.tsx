import { Provider } from 'mobx-react';
import { Fragment } from 'react';
import { render } from 'react-dom';
import { Editor } from './components/global/Editor';
import { Sidebar } from './components/global/Sidebar';
import stores from './stores';
import './styles/app.pcss';

const App = () => (
  <Provider {...stores}>
    <Fragment>
      <Editor />
      <Sidebar />
    </Fragment>
  </Provider>
);

render(<App />, document.querySelector('#app'));
