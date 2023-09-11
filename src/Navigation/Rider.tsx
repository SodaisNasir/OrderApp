import React from 'react';

import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import RiderDashBoard from '../Screens/Rider/Dashboard';
import AllOrdersScreen from '../Screens/Orders/InProgressOrders';
import SettingsScreen from '../Screens/Common/Settings';
import { scale } from 'react-native-size-matters';
import { Colors } from '../Constants/Colors';
import CurrentDeliveryScreen from '../Screens/Rider/CurrentDelivery';
import CompletedOrdersScreen from '../Screens/Orders/CompletedOrders';
import OrderDetailsScreen from '../Screens/Common/OrderDetails';

const MaterialTabs = createMaterialTopTabNavigator();
const Stack = createStackNavigator();


const AllDeliveriesStack: React.FC = () => {
return (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen
    name="Deliveries" component={CompletedOrdersScreen}
    />
     <Stack.Screen
    name="Order Details" component={OrderDetailsScreen}
    />
  </Stack.Navigator>

)
}



export const RiderTabs: React.FC = () => {
    return (
      <MaterialTabs.Navigator
      screenOptions={{
        tabBarLabelStyle: {fontSize: scale(8), color: Colors.backgroundColor},
        // tabBarItemStyle: { width: },
        tabBarStyle: {backgroundColor: Colors.primary},
        tabBarActiveTintColor: 'red',

        tabBarIndicatorStyle: {
          backgroundColor: 'red',
        },
      }}>
        <MaterialTabs.Screen
          name="Scanner"
          // options={(focused)=>}
          component={RiderDashBoard}
        />
        <MaterialTabs.Screen name="Current Delivery" component={CurrentDeliveryScreen} />
        <MaterialTabs.Screen name="All Deliveries" component={AllDeliveriesStack}  />
        <MaterialTabs.Screen name="Settings" component={SettingsScreen} />
      </MaterialTabs.Navigator>
    );
}