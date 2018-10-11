import { Provider } from 'mobx-react';
import { render } from 'react-dom';
import stores from './stores';
import './styles/reset.pcss';

const App = () => (
  <Provider {...stores}>
    <div>1</div>
  </Provider>
);

render(<App />, document.querySelector('#app'));
