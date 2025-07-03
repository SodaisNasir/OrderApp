/**
 * @format
 */

import { AppRegistry, View } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import store from './src/Redux/Strore';
import { Provider } from 'react-redux';

const Root = () => (
  <Provider store={store}>
    <View style={{ flex: 1, paddingTop: 25 }}>
      <App />
    </View>
  </Provider>
);
AppRegistry.registerComponent(appName, () => Root);
