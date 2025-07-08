/**
 * @format
 */

import {AppRegistry, View} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import store from './src/Redux/Strore';
import {Provider} from 'react-redux';
import {SafeAreaView} from 'react-native-safe-area-context';

const Root = () => (
  <SafeAreaView style={{flex: 1}}>
    <Provider store={store}>
      <App />
    </Provider>
  </SafeAreaView>
);
AppRegistry.registerComponent(appName, () => Root);
