import React, { useState } from 'react';

import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import NewOrdersScreen from '../Screens/Orders/NewOrders';
import CancelledOrdersScreen from '../Screens/Orders/CompletedOrders';
import { scale } from 'react-native-size-matters';
import { Colors } from '../../important/Colors';
import OrderDetailsScreen from '../Screens/Common/OrderDetails';
import SettingsScreen from '../Screens/Common/Settings';
import InProgressOrdersScreen from '../Screens/Orders/InProgressOrders';
import NewOrderDetail from '../Screens/Common/NewOrderDetail';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LogoutModal from '../Components/Modal/LogoutModal';
import Inventory from '../Screens/Common/Inventory';

const MaterialTabs = createMaterialTopTabNavigator();
const BottomTab = createBottomTabNavigator();
const Stack = createStackNavigator();

const NewOrderStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="New Orders"
        // options={(focused)=>}
        component={NewOrdersScreen}
      />
      <Stack.Screen
        name="Order Details"
        // options={(focused)=>}
        component={OrderDetailsScreen}
      />
      <Stack.Screen
        name="NewOrderDetail"
        // options={(focused)=>}
        component={NewOrderDetail}
      />
    </Stack.Navigator>
  );
};
const AllOrderStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="All Orders" component={InProgressOrdersScreen} />
      <Stack.Screen
        name="Order Details"
        // options={(focused)=>}
        component={OrderDetailsScreen}
      />
    </Stack.Navigator>
  );
};

const CompletedOrderStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Cancelled Orders" component={CancelledOrdersScreen} />
      <Stack.Screen
        name="Order Details"
        // options={(focused)=>}
        component={OrderDetailsScreen}
      />
    </Stack.Navigator>
  );
};
const SettingsStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingsHome" component={SettingsScreen} />
      <Stack.Screen name="Inventory" component={Inventory} />
    </Stack.Navigator>
  );
};


export const KitchenTabs = () => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={{ position: 'relative', flex: 1 }}>
      <BottomTab.Navigator
        screenOptions={{
          tabBarLabelStyle: { fontSize: scale(8), color: Colors.backgroundColor },
          tabBarStyle: { backgroundColor: Colors.primary, transform: [], },
        }}>
        <BottomTab.Screen
          name="New Orders"
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
          component={NewOrderStack}
        />
        <BottomTab.Screen
          name="InProgress Orders"
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
          component={AllOrderStack}
        />
        <BottomTab.Screen
          name="Completed Orders"
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
          component={CompletedOrderStack}
        />
        <BottomTab.Screen
          name="Settings"
          // listeners={{
          //   tabPress: e => {
          //     e.preventDefault();
          //     setModalVisible(true)
          //   },
          // }}
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
          component={SettingsStack}
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
