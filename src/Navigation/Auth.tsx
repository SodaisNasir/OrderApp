import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import LoginScreen from '../Screens/Auth/Login';

const Stack = createStackNavigator();

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen component={LoginScreen} name="login" />
    </Stack.Navigator>
  );
};
