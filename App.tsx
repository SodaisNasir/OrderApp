/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import 'react-native-gesture-handler';
import React, {useEffect} from 'react';
import type {PropsWithChildren} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import {Navigator} from './src/Navigation/Navigator';
import {Provider, useDispatch} from 'react-redux';
import store from './src/Redux/Strore';
import OneSignal from 'react-native-onesignal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getOrders, getRiderDeliveries } from './src/Redux/Reducers/Actions';

type SectionProps = PropsWithChildren<{
  title: string;
}>;

function App(): JSX.Element {
  useEffect(() => {
    OneSignal.setAppId('90598f53-e67e-47b1-afe8-8419b27d0756');

    // OneSignal.promptForPushNotificationsWithUserResponse()
    OneSignal.setNotificationWillShowInForegroundHandler(
      notificationReceivedEvent => {
        let notification = notificationReceivedEvent.getNotification();
        OneSignal.add;
        const data = notification.additionalData;
        notificationReceivedEvent.complete(notification);
        // if (data?.type == 'reminder') {
        //   sendLoc()
        // } else if (data?.type == 'message') {
        //   dispatch(getMessagesData(device));
        // } else {
        //   // console.log('vv')
        // }
      },
    );
    // OneSignal.setNotificationOpenedHandler((notification) => {})

    OneSignal.promptForPushNotificationsWithUserResponse();

    OneSignal.addSubscriptionObserver(async event => {
      if (event.to.isSubscribed) {
        const state = await OneSignal.getDeviceState();
        console.log('noti TOKEN ==>', state.userId);
        await AsyncStorage.setItem('onesignaltoken', state.userId);
        // console.log('state.userId', state.userId)
      }
    });
    checkAsyncStorage();
  }, []);

  const dispatch = useDispatch();

  const checkAsyncStorage = async () => {
    const data = await AsyncStorage.getItem('user');
    if (data != null) {
      const user = await JSON.parse(data);

      const loginAction: Login = {
        type: 'LOGIN',
        payload: user,
      };
      dispatch(loginAction);

      if (user.role_id == 2) {
        dispatch(getRiderDeliveries(user.id));
      } else {
        dispatch(getOrders('delivered'));
        dispatch(getOrders('neworder'));
        dispatch(getOrders('pending'));
      }
    }
   
  };

  return (
    <SafeAreaView style={{flex: 1}}>
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
