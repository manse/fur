import { Provider } from 'mobx-react';
import { render } from 'react-dom';
import { Layout } from './components/global/Layout';
import { LayoutEditor } from './components/global/LayoutEditor';
import { LayoutSidebar } from './components/global/LayoutSidebar';
import stores from './stores';
import './styles/app.pcss';

const App = () => (
  <Provider {...stores}>
    <Layout>
      <LayoutEditor />
      <LayoutSidebar />
    </Layout>
  </Provider>
);

render(<App />, document.querySelector('#app'));
