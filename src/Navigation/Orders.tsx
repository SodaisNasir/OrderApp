import React from 'react';

import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import NewOrdersScreen from '../Screens/Orders/NewOrders';
import CancelledOrdersScreen from '../Screens/Orders/CompletedOrders';
import {scale} from 'react-native-size-matters';
import {Colors} from '../Constants/Colors';
import OrderDetailsScreen from '../Screens/Common/OrderDetails';
import SettingsScreen from '../Screens/Common/Settings';
import InProgressOrdersScreen from '../Screens/Orders/InProgressOrders';
import NewOrderDetail from '../Screens/Common/NewOrderDetail';

const MaterialTabs = createMaterialTopTabNavigator();
const Stack = createStackNavigator();

const NewOrderStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
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
    <Stack.Navigator screenOptions={{headerShown: false}}>
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
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Cancelled Orders" component={CancelledOrdersScreen} />
      <Stack.Screen
        name="Order Details"
        // options={(focused)=>}
        component={OrderDetailsScreen}
      />
    </Stack.Navigator>
  );
};

export const KitchenTabs: React.FC = () => {
  return (
    <MaterialTabs.Navigator
    
      screenOptions={{
        tabBarLabelStyle: {fontSize: scale(8), color: Colors.backgroundColor},

        tabBarStyle: {backgroundColor: Colors.primary, transform : [] },
        tabBarActiveTintColor: 'red',

        tabBarIndicatorStyle: {
          backgroundColor: 'red',
        },
      }}>
      <MaterialTabs.Screen
        name="New Orders"
        // options={(focused)=>}
        component={NewOrderStack}
      />
      <MaterialTabs.Screen name="InProgress Orders" component={AllOrderStack} />
      <MaterialTabs.Screen
        name="Completed Orders"
        component={CompletedOrderStack}
      />
      <MaterialTabs.Screen name="Settings" component={SettingsScreen} />
    </MaterialTabs.Navigator>
  );
};
