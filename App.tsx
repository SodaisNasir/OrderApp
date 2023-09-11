/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
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
import { Navigator } from './src/Navigation/Navigator';
import { Provider } from 'react-redux';
import store from './src/Redux/Strore';
import  OneSignal  from 'react-native-onesignal';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SectionProps = PropsWithChildren<{
  title: string;
}>;



function App(): JSX.Element {
 
  useEffect(() => {
    OneSignal.setAppId('90598f53-e67e-47b1-afe8-8419b27d0756')
 

    // OneSignal.promptForPushNotificationsWithUserResponse()
    OneSignal.setNotificationWillShowInForegroundHandler(
      (notificationReceivedEvent) => {
        let notification = notificationReceivedEvent.getNotification()
        OneSignal.add
        const data = notification.additionalData
        notificationReceivedEvent.complete(notification)
        // if (data?.type == 'reminder') {
        //   sendLoc()
        // } else if (data?.type == 'message') {
        //   dispatch(getMessagesData(device));
        // } else {
        //   // console.log('vv')
        // }
      },
    )
    // OneSignal.setNotificationOpenedHandler((notification) => {})

OneSignal.promptForPushNotificationsWithUserResponse();

    OneSignal.addSubscriptionObserver(async (event) => {
      if (event.to.isSubscribed) {
        const state = await OneSignal.getDeviceState()
        console.log("noti TOKEN ==>", state.userId);
        await AsyncStorage.setItem('onesignaltoken', state.userId)
        // console.log('state.userId', state.userId)
      }
    })

  }, [])

  return (
    <SafeAreaView style={{flex:1}}>
    <Provider store={store}>
      <Navigator/>
    </Provider>
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
