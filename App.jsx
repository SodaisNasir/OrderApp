/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import React, { useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
} from 'react-native';

import { Navigator } from './src/Navigation/Navigator';
import { Provider, useDispatch } from 'react-redux';
import store from './src/Redux/Strore';
import {OneSignal} from 'react-native-onesignal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getOrders, getRiderDeliveries } from './src/Redux/Reducers/Actions';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
  // Initialize OneSignal SDK with your app ID
  OneSignal.initialize('90598f53-e67e-47b1-afe8-8419b27d0756');

  // Prompt user for push notifications permission
  OneSignal.Notifications.requestPermission(true);

  // Listen for notification click events
  OneSignal.Notifications.addEventListener('click', (event) => {
    console.log('Notification clicked:', event);
  });

  // Listen for push subscription state changes (to get OneSignal user ID)
  OneSignal.User.pushSubscription.addEventListener('change', async (event) => {
    if (event.to.optedIn) {
      const oneSignalUserId = await OneSignal.User.pushSubscription.getIdAsync();
      console.log('noti TOKEN ==>', oneSignalUserId);
      await AsyncStorage.setItem('onesignaltoken', oneSignalUserId);
    }
  });

  // Call your local method to check stored user data
  checkAsyncStorage();
}, []);


  const checkAsyncStorage = async () => {
    const data = await AsyncStorage.getItem('user');
    if (data != null) {
      const user = JSON.parse(data);

      dispatch({
        type: 'LOGIN',
        payload: user,
      });

      if (user.role_id === 2) {
        dispatch(getRiderDeliveries(user.id));
      } else {
        dispatch(getOrders('delivered'));
        dispatch(getOrders('neworder'));
        dispatch(getOrders('pending'));
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Navigator />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
