/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import React, { useEffect } from 'react';
import {
  Platform,
  SafeAreaView,
  StyleSheet,
} from 'react-native';

import { Navigator } from './src/Navigation/Navigator';
import { Provider, useDispatch } from 'react-redux';
import store from './src/Redux/Strore';
import { OneSignal, LogLevel } from 'react-native-onesignal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getOrders, getRiderDeliveries } from './src/Redux/Reducers/Actions';
import SplashScreen from 'react-native-splash-screen';
import { NavigationContainer } from '@react-navigation/native';


function App() {
  const dispatch = useDispatch();


  //   useEffect(() => {
  //   // Initialize OneSignal SDK with your app ID
  //   OneSignal.initialize('90598f53-e67e-47b1-afe8-8419b27d0756');

  //   // Prompt user for push notifications permission
  //   OneSignal.Notifications.requestPermission(true);

  //   // Listen for notification click events
  //   OneSignal.Notifications.addEventListener('click', (event) => {
  //     console.log('Notification clicked:', event);
  //   });

  //   // Listen for push subscription state changes (to get OneSignal user ID)
  //   OneSignal.User.pushSubscription.addEventListener('change', async (event) => {
  //     if (event.to.optedIn) {
  //       const oneSignalUserId = await OneSignal.User.pushSubscription.getIdAsync();
  //       console.log('noti TOKEN ==>', oneSignalUserId);
  //       await AsyncStorage.setItem('onesignaltoken', oneSignalUserId);
  //     }
  //   });

  //   // Call your local method to check stored user data
  //   checkAsyncStorage();
  // }, []);

  useEffect(() => {
    // Set the log level for debugging
    OneSignal.Debug.setLogLevel(LogLevel.Verbose);

    // Initialize OneSignal
    OneSignal.initialize('04869310-bf7c-4e9d-9ec9-faf58aac8168');
    //Burger Point OnesiganlAppId
    // OneSignal.initialize("2de883ec-be41-4820-a517-558beee8b0ac");

    // Request notification permission
    OneSignal.Notifications.requestPermission(false).then(granted => {
      console.log('Permission granted:', granted);
    });

    // Handle notifications shown in foreground
    OneSignal.Notifications.addEventListener(
      'willDisplay',
      notificationWillDisplayEvent => {
        const notification = notificationWillDisplayEvent.getNotification();
        console.log('Notification in foreground:', notification);
        notificationWillDisplayEvent.complete(notification);
      },
    );

    // Handle notification clicks
    OneSignal.Notifications.addEventListener(
      'clicked',
      notificationClickEvent => {
        console.log('Notification clicked:', notificationClickEvent);
      },
    );

    // Subscription observer for user ID
    OneSignal.User.pushSubscription.addEventListener('change', async event => {
      console.log('event ==>', event);
      if (event.current.optedIn) {
        const userId = await OneSignal.User.pushSubscription.getIdAsync();
        const deviceToken =
          await OneSignal.User.pushSubscription.getTokenAsync();
        // console.log("User ID:", userId);
        // console.log("Device User ID:", event.current.token || deviceToken);
        await AsyncStorage.setItem('onesignaltoken', userId || '');
        await AsyncStorage.setItem('deviceToken', userId);

      }
    });

    // Hide splash screen after some delay
    // if (Platform.OS !== 'ios') {
    //   setTimeout(() => {
    //     SplashScreen.hide();
    //   }, 3500);
    // } else {
    //   SplashScreen.hide();
    // }

    checkAsyncStorage()

    // return () => {
    //   // Cleanup listeners
    //   OneSignal.Notifications.removeEventListener(
    //     "willDisplay",
    //     () => {}
    //   );
    //   OneSignal.Notifications.removeEventListener(
    //     "clicked",
    //     () => {}
    //   );
    //   OneSignal.User.pushSubscription.removeEventListener("change", () => {});
    // };
  }, []);
  if (Platform.OS !== 'ios') {
    setTimeout(() => {
      SplashScreen.hide();
    }, 3500);
  } else {
    SplashScreen.hide();
  }
  const check = async () => {
    const notification = await AsyncStorage.getItem('onesignaltoken');
    console.log('notification ======>', notification)

  }

  check()

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
      <NavigationContainer>
        <Navigator />
      </NavigationContainer>
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
