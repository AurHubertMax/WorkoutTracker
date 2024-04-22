// BottomTabNavigator.js
import React, { useRef, useState, useContext, createContext, useEffect } from 'react';
import ItemScreen from './ItemScreen';
import HomeScreen from './WelcomeScreen';
import ProgressScreen from './ProgressScreen';
import { createBottomTabNavigator, BottomTabBar } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Modal, Text, Touchable, View } from 'react-native';
import { TextInput, Button, TouchableOpacity } from 'react-native';
import { Image, Animated } from 'react-native';
import { Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import ModalDropdown from 'react-native-modal-dropdown';




const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();



//TOP BAR
function HomeStackScreen({ navigation, toggleEditing}) {
    const [modalVisible, setModalVisible] = useState(false);
    const [inputText, setInputText] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isEditingItems, setIsEditingItems] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [iconName, setIconName] = useState('check-circle-outline');
    const [iconColor, setIconColor] = useState('black');
    //receive items from HomeScreen
    const [items, setItems] = useState([]);

    useEffect(() => {
        if (isEditing === true) {
            setIconName('check');
        }
        else if (isEditing === false) { 
            setIconName('check-circle-outline');
        }
    }, [isEditing]);

    useEffect(() => {
        if (isEditingItems === true) {
            setIconName('check');
        }
        else if (isEditingItems === false) { 
            setIconName('check-circle-outline');
        }
    }, [isEditingItems]);

    return (
        <View
        style={{ flex: 1 }}
        >
            
            <HomeStack.Navigator
            screenOptions={{
                headerShown: true,
            }}
            >
                <HomeStack.Screen 
                name="HomeScreen" 
                options={{
                    
                    headerTitle: () => (
                        <Image
                        style={{ width: 50, height: 50 }}
                        source={require('../../assets/LogoV1.jpg')}
                        />
                    ),
                    headerRight: () => (
                        <View
                        marginRight={15}
                        flexDirection='row'
                        >
                            <View
                            marginLeft={15}
                            >
                                
                            </View>
                            <TouchableOpacity
                            style={{
                                marginRight: 15,
                            }}
                            
                            onPress={() => {
                                setIsEditing(prevIsEditing => !prevIsEditing);
                                setIconColor('#007AFF');
                                if (iconName != 'check-circle-outline') {
                                    setIconColor('black');
                                }
                                console.log("pressed isEditing button")
                                console.log("isEditing: " + isEditing)

                            }}
                            >
        
                                <MaterialCommunityIcons 
                                    name={iconName} 
                                    size={28} 
                                    color={iconColor} 
                                    
                                />
                            </TouchableOpacity>
                                
                            
                        </View>
                    ),

                }}
                >
                    {props => <HomeScreen {...props} 
                    isEditing={isEditing} 
                    setIsEditing={setIsEditing} 
                    />}
                </HomeStack.Screen>

                
                <HomeStack.Screen 
                name="ItemScreen" 
                options={{
                    headerRight: () => (
                        <View
                        marginRight={15}
                        flexDirection='row'
                        >
                            <View
                            marginLeft={15}
                            >

                                
                            </View>
                                <TouchableOpacity
                                style={{
                                    marginRight: 15,
                                }}
                                
                                onPress={() => {
                                    setIsEditingItems(prevIsEditingItems => !prevIsEditingItems);
                                    setIconColor('#007AFF');
                                    
                                    if (iconName != 'check-circle-outline') {
                                        setIconColor('black');
                                    }
                                    console.log("pressed isEditingItems button")
                                    console.log("isEditingItems: " + isEditingItems)

                                }}
                                >
        
                                    <MaterialCommunityIcons 
                                        name={iconName} 
                                        size={28} 
                                        color={iconColor} 
                                    />
                            </TouchableOpacity>
                            
                        </View>
                    ),
  
                }}
                >
                    {props => <ItemScreen {...props}
                    isEditingItems={isEditingItems}
                    setIsEditingItems={setIsEditingItems}
                    />}
                </HomeStack.Screen>
            </HomeStack.Navigator>
        </View>
                

    );
}



//BOTTOM BAR
function BottomTabNavigator( {navigation} ) {

    
    return (
        
        
        <View style={{
            flex: 1,
            
        }}
        >
            
            
            <Tab.Navigator
            screenOptions={{ headerShown: false}}
            >
                <Tab.Screen
                name="Home"
                component={HomeStackScreen}
                
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <TouchableOpacity style={{ 
                            alignSelf: 'center',
                            marginTop: 0, 
                            }}
                            
                            >
                            <MaterialCommunityIcons 
                            name="home" 
                            color='#007AFF' 
                            size={30} 
                            onPress={() => navigation.navigate('HomeScreen')}
                            />

                            
                        </TouchableOpacity>
                    ),
                }}
                />

                <Tab.Screen
                name="ProgressScreen"
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <TouchableOpacity style={{ 
                                alignSelf: 'center',
                                marginTop: 0, 
                            }}
                            onPress={() => navigation.navigate('ProgressScreen')}
                            >
                            <MaterialCommunityIcons 
                            name="chart-box" 
                            color='orange' 
                            size={30} 
                            
                            />
                        </TouchableOpacity>
                    ),
                }}
                >
                    {() => <ProgressScreen items={HomeScreen} />}
                </Tab.Screen>
            </Tab.Navigator>
        </View>
        
    );
    
}


export default BottomTabNavigator;


