import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { TextInput, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Alert } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { Animated } from 'react-native';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

  
  const Workouts = ({route, isEditing, setIsEditing}) => {
    const navigation = useNavigation();
  

    const [data, setData] = useState([]);

    const [itemModalVisible, setItemModalVisible] = useState(false);
    const [inputText, setInputText] = useState('');

    //checkbox handler*********************************************************
    const [checkedItems, setCheckedItems] = useState([]);


    //DATA STORAGE*********************************************************

    // function to store data in local storage
    const storeData = async (item) => {
        try {
          const jsonValue = JSON.stringify(item);
          await AsyncStorage.setItem('@storage_Key', jsonValue);
        }
        catch (error) {
          console.log(error);
        }
    };



    

    // load data from local storage when component mounts
    useEffect(() => {
        const getData = async () => {
          try {
            const storedData = await AsyncStorage.getItem('@storage_Key');
            if (storedData!= null) {
              setData(JSON.parse(storedData));
            }
          }
    
          catch (error) {
            console.log(error);
          }
        };
    
        getData();
      }, []);

    //DATA STORAGE*********************************************************
  

            
  
    // Lets user add new item element to the dropdown list
    const addItem = async (item) => {
      if (item) {
        const newData = [...data, {label: item, value: uuidv4(), isChecked: false}];
        setData(newData);
  
        // store the new data in local storage
        await storeData(newData)
      }
    };
  
    
  
    // confirm delete single item**********************************************
    const confirmDelete = (index) => {
      Alert.alert(
        'Delete Item',
        `Are you sure you want to delete this item: ${data[index].label} ?`,
        [
          {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
          {text: 'Delete', onPress: () => deleteItem(index)},
        ],
        { cancelable: false }
      );
    };

    // function to delete single item from page scroll view
    const deleteItem = async (index) => {
        
        let newData = [...data];
        newData.splice(index, 1);

        //save data to storage
        try{
            await AsyncStorage.removeItem(`@storage_Key_${data[index].value}`);
            setData(newData);
            await AsyncStorage.setItem('@storage_Key', JSON.stringify(newData));
        }

        catch (error) {
            console.log(error);
        }
        
    };

    //confirm delete multiple items**********************************************
    const confirmDeleteMultiple = () => {
        Alert.alert(
            'Delete Items',
            `Are you sure you want to delete these items?`,
            [
              {text: 'Cancel', onPress: () => {
                console.log('Cancel Pressed')
                setData(data.map(item => ({ ...item, isChecked: false })));
                }, 
                style: 'cancel'},
              {text: 'Delete', onPress: () => deleteMultipleItems()},
            ],
            { cancelable: false }
            );
    };

    const deleteMultipleItems = async () => {
        let newData = [...data];
        let newCheckedItems = [...checkedItems];
        let newCheckedItemsValues = newCheckedItems.map(item => item.value);
        newData = newData.filter(item => !newCheckedItemsValues.includes(item.value));
        setData(newData);
        setCheckedItems([]);
    };

    //animation handler*********************************************************
    const animatedValue = useRef(new Animated.Value(0)).current;
    
    const translateItems = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 50],
    });

    const toggleEditing = () => {
        Animated.timing(animatedValue, {
            toValue: isEditing ? 1 : 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
        
    };

    useEffect(() => {
        toggleEditing();
    }, [isEditing]);


    //for checkbox
    useEffect(() => {
        if (!isEditing) {
            
            setData(data.map(item => ({ ...item, isChecked: false })));
            setCheckedItems([]);
        }
    }, [isEditing]);

    
    useEffect(() => {
        console.log('checked items: ', checkedItems);
    }, [checkedItems]);

    //pass item to BottomTabNavigator
    useEffect(() => {
        navigation.setParams({checkedItems: checkedItems});
    }, [checkedItems]);
    
    
  
    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <KeyboardAwareScrollView>

                    <View style={{flex: 1}}>
                    {data.map((item, index) => (
                        <View 
                        style={{ 
                            flexDirection: 'row', 
                            alignItems: 'center',
                            position: 'relative',
                            
                         }}
                        key={index}
                        >
                            <BouncyCheckbox
                            style={{
                                position: 'absolute',
                                left: 0,
                                zIndex: 1,
                                opacity: isEditing ? 1 : 0,
                            }}
                            disableBuiltInState={false}
                            isChecked={item.isChecked}
                            onPress={
                                
                                () => {
                                    const newIsChecked = !item.isChecked;
                                    item.isChecked = newIsChecked;
                                    setData([...data]);

                                    if (newIsChecked) {
                                        setCheckedItems([...checkedItems, item]);
                                    }
                                        
                                    else {
                                        setCheckedItems(checkedItems.filter(checkedItem => checkedItem.value !== item.value));
                                    }
                                }
                                
                            
                            }
                            />
                        
                            <Animated.View 
                            key={index} 
                            style={{ 
                                transform: [{ translateX: translateItems }], 
                                zIndex: 2,
                                flex: 1,
                                }}>
                                <TouchableOpacity 
                                key={index} 
                                onPress={() => {
                                    if (!isEditing) {
                                        navigation.navigate('ItemScreen', { item: item})
                                    }
                                }}>
                                    <View style={styles.itemContainer}>
                                        
                                        <Text style={styles.itemText}>{item.label}</Text>
                                
                                        <TouchableOpacity 
                                        onPress={() => {
                                            confirmDelete(index); 
                                        }} 
                                        style={{ opacity: 0.5 }}>
                                            <Icon name='trash' size={35} color='gray' />
                                            
                                        </TouchableOpacity>
                                        
                                    </View>
                                </TouchableOpacity>
                            </Animated.View>
                        </View>
                    ))}
                    </View>
                </KeyboardAwareScrollView>  
            
                <Modal
                animationType="fade"
                transparent={true}
                visible={itemModalVisible}
                onRequestClose={() => {
                    setItemModalVisible(!itemModalVisible);
                }}
                >
                    <View style={{ 
                        flex: 1, 
                        justifyContent: 'center',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)', 
                        alignItems: 'center', 
                        }}
                        >
                        <View style={{ 
                            shadowColor: 'black',
                            shadowOpacity: 0.1,
                            backgroundColor: 'white', 
                            padding: 20, 
                            borderRadius: 10 
                            }}
                            >

                            <TextInput 
                            style={{ 
                                opacity: 0.8,
                                height: 40, 
                                borderColor: 'gray',
                                backgroundColor: '#f1f8ff',
                                borderRadius: 10,  
                                width: 200, 
                                marginBottom: 10 }}
                            textAlign='center'
                            placeholderTextColor={'gray'}
                            placeholder="Enter new item" 
                            alignItems="center"
                            autoFocus={true}

                            onChangeText={text => setInputText(text)}
                            />
                            <Button title="Done" onPress={() => 
                                {setItemModalVisible(false);
                                addItem(inputText);
                                setInputText(null);
                            }} 
                            />
                        </View>
                    </View>
                </Modal>
                <View
                style={{ 
                    position: 'absolute', 
                    right: 10, 
                    bottom: 10, 
                    padding: 10, 
                    zIndex: 4,
                }}
                >
                    <MaterialCommunityIcons 
                        name="plus-box-outline" 
                        size={30} 
                        color="black" 
                        onPress={() => {
                            setItemModalVisible(true);
                        }}
                        
                    />
                </View>
                <View
                style={{ 
                    position: 'absolute', 
                    left: 10, 
                    bottom: 10, 
                    padding: 10, 
                    zIndex: 4,
                    }}
                >
                    {isEditing && (
                    <MaterialCommunityIcons 
                        name="trash-can-outline" 
                        size={30} 
                        color="red" 
                        onPress={() => {
                            confirmDeleteMultiple();
                        }}
                        
                    />
                    )}
                </View>
        </View>

    );
  
  };
  
  
  export default Workouts;
  
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'space-between',
      fontWeight: 'bold',
      backgroundColor: '#fff',
      padding: 20,
    },
  
    itemContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 10,
      margin: 5,
      backgroundColor: '#f1f8ff',
      borderRadius: 10,
      borderColor: 'black',
      borderWidth: 1.5,
    },
  
    inputContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 20,
    },
  
    input: {
      flex: 1,
      justifyContent: 'space-between',
      paddingLeft: 20,
      height: 40,
      borderColor: 'gray',
      borderWidth: 1.5,
      marginBottom: 10,
      marginRight: 20,
      borderRadius: 10,
    },

    plusIcon: {
        opacity: 0.5,
        marginRight: 15,
        marginBottom: 10,
    },
  
    button: {
      marginBottom: 10,
    },
  
    itemView: {
      width: '100%',
      margin: 5,
      padding: 40,
    },
  
    itemText: {
      flex: 0,
      textAlign: 'center',
      fontSize: 30,
      fontWeight: 'bold',
    },
  
    
  });
  