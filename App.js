import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import BottomTabNavigator from './App/assets/Screens/BottomTabNavigator';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();



const StartingScreen = () => {
  return (

      <NavigationContainer>
        <View 
        style={{flex: 1}} 
        >
            <Stack.Navigator
            screenOptions={{ headerShown: false}}
            >
              
              <Stack.Screen 
              name="BottomNav" 
              component={BottomTabNavigator} 
              />
              
            </Stack.Navigator>
        </View>
      </NavigationContainer>
      

  );

  //<Stack.Screen name="ItemScreen" component={ItemScreen} />
  //<Stack.Screen name="Home" component={HomeScreen} />
  //<Stack.Screen name="BottomTabNavigator" component={BottomTabNavigator} />

};


export default StartingScreen;

