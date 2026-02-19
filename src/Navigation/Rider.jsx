import React, { useState } from 'react';

import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createStackNavigator } from '@react-navigation/stack';
// import RiderDashBoard from '../Screens/Rider/RiderDashBoard';
import AllOrdersScreen from '../Screens/Orders/InProgressOrders';
import SettingsScreen from '../Screens/Common/Settings';
import { scale } from 'react-native-size-matters';
import { Colors } from '../../important/Colors';
import CurrentDeliveryScreen from '../Screens/Rider/CurrentDelivery';
import CompletedOrdersScreen from '../Screens/Orders/CompletedOrders';
import OrderDetailsScreen from '../Screens/Common/OrderDetails';
import RiderDashBoard from '../Screens/Rider/RiderDashBoard';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, StyleSheet, View } from 'react-native';
import LogoutModal from '../Components/Modal/LogoutModal';

const MaterialTabs = createMaterialTopTabNavigator();
const Stack = createStackNavigator();
const BottomTab = createBottomTabNavigator();

const AllDeliveriesStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Deliveries" component={CompletedOrdersScreen} />
      <Stack.Screen name="Order Details" component={OrderDetailsScreen} />
    </Stack.Navigator>
  );
};

const AllRiderDeliversStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Current Delivery" component={CurrentDeliveryScreen} />
      <Stack.Screen name="Order Details" component={OrderDetailsScreen} />
    </Stack.Navigator>
  )
}

export const RiderTabs = () => {
  const [modalVisible, setModalVisible] = useState(false);
  return (
    <View style={{ position: 'relative', flex: 1 }}>
      <BottomTab.Navigator
        screenOptions={{
          tabBarLabelStyle: { fontSize: scale(8), color: Colors.backgroundColor },
          tabBarStyle: { backgroundColor: Colors.primary, transform: [] },
        }}>
        <BottomTab.Screen
          name="Scanner"
          options={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarIcon: ({ color, focused }) => (
              <View
                style={[
                  styles.tabbar,
                  { backgroundColor: focused ? Colors.white : Colors.primary },
                ]}>
                <Image
                  resizeMode="contain"
                  style={{
                    flex: 1,
                    tintColor: focused ? Colors.primary : Colors.white,
                  }}
                  source={require('../assets/tab/Home.png')}
                />
              </View>
            ),
          }}
          // options={(focused)=>}
          component={RiderDashBoard}
        />
        <BottomTab.Screen
          options={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarIcon: ({ color, focused }) => (
              <View
                style={[
                  styles.tabbar,
                  { backgroundColor: focused ? Colors.white : Colors.primary },
                ]}>
                <Image
                  resizeMode="contain"
                  style={{
                    flex: 1,
                    tintColor: focused ? Colors.primary : Colors.white,
                  }}
                  source={require('../assets/tab/clock.png')}
                />
              </View>
            ),
          }}
          name="All RiderDeliver"
          component={AllRiderDeliversStack}
        />
        <BottomTab.Screen
          options={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarIcon: ({ color, focused }) => (
              <View
                style={[
                  styles.tabbar,
                  { backgroundColor: focused ? Colors.white : Colors.primary },
                ]}>
                <Image
                  resizeMode="contain"
                  style={{
                    flex: 1,
                    tintColor: focused ? Colors.primary : Colors.white,
                  }}
                  source={require('../assets/tab/Document.png')}
                />
              </View>
            ),
          }}
          name="All Deliveries"
          component={AllDeliveriesStack}
        />
        <BottomTab.Screen
          options={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarIcon: ({ color, focused }) => (
              <View
                style={[
                  styles.tabbar,
                  { backgroundColor: focused ? Colors.white : Colors.primary },
                ]}>
                <Image
                  resizeMode="contain"
                  style={{
                    flex: 1,
                    tintColor: focused ? Colors.primary : Colors.white,
                  }}
                  source={require('../assets/tab/logout.webp')}
                />
              </View>
            ),
          }}
          listeners={{
            tabPress: e => {
              e.preventDefault();
              setModalVisible(true);
            },
          }}
          name="Settings"
          component={SettingsScreen}
        />
      </BottomTab.Navigator>
      <LogoutModal
        modalVisible={modalVisible}
        setModalVisible={() => setModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  tabbar: {
    height: 35,
    width: 35,
    top: 7,
    // backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    padding: 7,
    overflow: 'hidden',
  },
});
