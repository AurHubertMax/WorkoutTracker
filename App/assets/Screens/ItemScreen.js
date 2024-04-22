import { View, Text, StyleSheet, ScrollView } from 'react-native';
import React, { Component } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TextInput, Button } from 'react-native';
import { Table, TableWrapper, Row, Rows, Col, Cols, Cell } from 'react-native-reanimated-table';
import { TouchableOpacity, Animated } from 'react-native';
import { Modal } from 'react-native';
import { MaterialCommunityIcons } from 'react-native-vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import BouncyCheckbox from 'react-native-bouncy-checkbox';



class ItemScreen extends Component {
    constructor(props) {
      super(props);
      this.state = {
        tableHead: ['Exercise', 'lbs', 'S x R'],
        widthArr: [197, 80, 80],
        tableData: [],
        modalVisible: false,
        modalSelectedRow: null,
        isEditingItems: false,
        animatedValue: new Animated.Value(0),
        selectedItems: [],
        CheckBoxState: false,
      };

    }

    async componentDidMount() {
        try {
            this.props.navigation.setOptions({ title: this.props.route.params.item.label });
            const itemKey = `@storage_Key_${this.props.route.params.item.value}`;
            const storedData = await AsyncStorage.getItem(itemKey);
            
            if (storedData !== null) {
                
                let parsedData = JSON.parse(storedData);
                this.setState({tableData: parsedData});
            }

            else{
                const newTableData = Array(2).fill('').map(() => Array(3).fill(''));
                this.setState({tableData: newTableData});
            }
            //this.storeVolumes();
            const parsedData = this.state.tableData;
            for (let i = 0; i < parsedData.length; i++) {
                const exercise = parsedData[i][0];
                if (exercise === '' || exercise === null) {
                    continue;
                }
                const volumeKey = `@volume_${this.props.route.params.item.value}_${exercise}`;
                const storedVolumes = await AsyncStorage.getItem(volumeKey);
                if (storedVolumes === null) {
                    let volumes = [];
                    await AsyncStorage.setItem(volumeKey, JSON.stringify(volumes));
                }
            }

        } catch (error) {
            console.log(error);
        }

        this.displayAllVolumes();
        
    }

    //store volumes
    storeVolumes = async () => {
        try {
            const parsedData = this.state.tableData;

            //calculate and store volume for each exercise
            for (let i = 0; i < parsedData.length; i++) {
                const totalVolume = 0;
                if (parsedData[i][0] === '' || parsedData[i][1] === '' || parsedData[i][2] === '') {
                    const weights = 0;
                    const sets = 0;
                    const reps = 0;
                    const totalVolume = weights * sets * reps;
                } else {
                    const weights = parseInt(parsedData[i][1]);
                    const setsAndReps = parsedData[i][2].split('X');
                    const sets = parseInt(setsAndReps[0]);
                    const reps = parseInt(setsAndReps[1]);
                    const totalVolume = weights * sets * reps;
                }

                const exercise = parsedData[i][0];
                if (exercise === '' || exercise === null) {
                    continue;
                }
                const volumeKey = `@volume_${this.props.route.params.item.value}_${exercise}`;
                const storedVolumes = await AsyncStorage.getItem(volumeKey);
                let volumes = storedVolumes ? JSON.parse(storedVolumes) : [];
                volumes.push(totalVolume);
                await AsyncStorage.setItem(volumeKey, JSON.stringify(volumes));
            }
        } catch (e) {
            console.log("store volumes ERROR: ", e);
        }
    }

    //delete all volumes
    deleteAllVolumes = async () => {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const volumeKeys = keys.filter(key => key.startsWith('@volume_'));
    
            for (let volumeKey of volumeKeys) {
                await AsyncStorage.removeItem(volumeKey);
            }
        } catch (e) {
            console.log("delete all volumes ERROR: ", e);
        }
    }

    //display volumes stored in async storage
    displayAllVolumes = async () => {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const volumeKeys = keys.filter(key => key.startsWith('@volume_'));
    
            for (let volumeKey of volumeKeys) {
                const storedVolumes = await AsyncStorage.getItem(volumeKey);
                let volumes = storedVolumes ? JSON.parse(storedVolumes) : [];
                console.log(`Volumes for ${volumeKey}: `, volumes);
            }
        } catch (e) {
            console.log("display all volumes ERROR: ", e);
        }
    }

    componentDidUpdate(prevProps, prevState) {
        
      if (prevState.tableData !== this.state.tableData) {
        this.storeData();
      }

      if (prevProps.isEditingItems !== this.state.isEditingItems) {
          this.toggleEditing();
      }
      
    }

    

    storeData = () => {
        try {
            const jsonValue = JSON.stringify(this.state.tableData);
            const itemKey = `@storage_Key_${this.props.route.params.item.value}`;
            AsyncStorage.setItem(itemKey, jsonValue);
        }
        catch (error) {
            console.log(error);
        }
        
    }
    //Add row ******************************************************
    handleAddRow = () => {
        this.setState(prevState => {
            const newTableData = [...prevState.tableData];
            newTableData.push(Array(3).fill(''));
            return {tableData: newTableData};
        
        })
    }


    //Update row ************************************************
    updateRow = async (newData, rowIndex, colIndex) => {
        this.setState(prevState => {
            const newTableData = [...prevState.tableData];
            newTableData[rowIndex][colIndex] = newData;
            return {tableData: newTableData};
        }, async () => {
            this.storeData();

        });
        
    }

    //Sets x Reps Modal Hanlders ********************************

    //handles SxR row press
    handleSxRRowPress = (cellIndex) => {
        console.log('cell index at row press: ', cellIndex)
        this.setState({modalSelectedRow: cellIndex});
        this.handleSxRModal();
        
    }


    handleSxRModal = () => {
        this.setState({ modalVisible: true });
        console.log('-------------------------')
        console.log('cell pressed');
    }

    closeSxRModal = () => {
        this.modalInput1 = null;
        this.modalInput2 = null;
        this.setState({ modalVisible: false });
    }

    //focus handler **************************************************************
    firstSxRModalInputRef = React.createRef();
    secondSxRModalInputRef = React.createRef();

    handleSxRModalShow = () => {
        this.firstSxRModalInputRef.current.focus();
    }

    handleFirstinput = (newText) => {
        this.setState({modalInput1: newText});
        
        if (newText.length === 1) {
            this.secondSxRModalInputRef.current.focus();
        }
    }

    handleSecondInput = (newText) => {
        this.setState({modalInput2: newText});
        
    }

    //modal input to table handler
    handleSxRModalClose = () => {
        if (this.state.modalInput1 === undefined || this.state.modalInput2 === null) {
            newData = '';
        }

        else{
            newData = this.state.modalInput1 + ' X ' + this.state.modalInput2;
        }

        
        this.updateRow(newData, this.state.modalSelectedRow, 2)
        this.closeSxRModal();
    }

    
    // render modal ******************************************************
    renderModal = () => {
        return(
            <Modal
            animationType="fade"
            transparent={true}
            visible={this.state.modalVisible}
            onShow={this.handleSxRModalShow}
            onRequestClose={this.closeSxRModal}>
                <View style={styles.modalCenteredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>Sets x Reps</Text>
                        <View style={{ 
                            flexDirection: 'row',  
                            alignItems: 'center'}}>

                            <TextInput
                            ref={this.firstSxRModalInputRef}
                            style={styles.modalInput}
                            keyboardType='numeric'
                            maxLength={1}
                            onChangeText={
                                this.handleFirstinput
                            }/>

                            <Text style={{marginHorizontal: 10}}>X</Text>

                            <TextInput
                            ref={this.secondSxRModalInputRef}
                            style={styles.modalInput}
                            keyboardType='numeric'
                            onChangeText={
                                this.handleSecondInput
                            }/>
                        </View>
                        <Button
                        title="Done"
                        onPress={this.handleSxRModalClose}/>
                    </View>
                </View>

            </Modal>
        );
    }



    //toggle editing ******************************************************

    toggleEditing = () => {
        Animated.timing(this.state.animatedValue, {
            toValue: this.props.isEditingItems ? 1 : 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            if (!this.props.isEditingItems) {
                this.setState({selectedItems: [] });
            }
        });
    };

    
    //modal to confirm delete selected items
    handleDeleteSelectedItems = async () => {
        this.setState(prevState => {
            const newTableData = prevState.tableData.filter((item, index) => {
                if (prevState.selectedItems.includes(index)) {
                    const exercise = item[0];
                    const volumeKey = `@volume_${this.props.route.params.item.value}_${exercise}`;
                    AsyncStorage.removeItem(volumeKey);
                }
                return !prevState.selectedItems.includes(index);
            
            });
            return {tableData: newTableData, selectedItems: []};
        })
    }

    //display completed exercises
    handleComplete = async () => {
        await this.storeVolumes();
        this.getVolumes();  
    }

    handleClearVolume = () => {
        this.clearVolumes();
        this.getVolumes(); 
    }

    getVolumes = async () => {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const volumeKeys = keys.filter(key => key.startsWith('@volume_'));
    
            for (let volumeKey of volumeKeys) {
                const storedVolumes = await AsyncStorage.getItem(volumeKey);
                let volumes = storedVolumes ? JSON.parse(storedVolumes) : [];
                console.log(`Volumes for ${volumeKey}: `, volumes);
            }
        } catch (e) {
            console.log("get volumes ERROR: ", e);
        }
    }

    clearVolumes = async () => {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const volumeKeys = keys.filter(key => key.startsWith('@volume_'));
    
            for (let volumeKey of volumeKeys) {
                await AsyncStorage.removeItem(volumeKey);
            }
        } catch (e) {
            console.log("clear volumes ERROR: ", e);
        }
    }



    render(){
        const state = this.state;
        const tableData = this.state.tableData;
        

        const translateX = this.state.animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 50],
        });


        return (
            
            <View style={styles.container}>
                
                <TouchableOpacity>
                    
                    <MaterialCommunityIcons 
                        name="trash-can-outline" 
                        size={30} 
                        color="red" 
                        onPress={this.handleDeleteSelectedItems}
                        style={{
                            position: 'absolute',
                            left: 20,
                            top: 600,
                            zIndex: 3,
                            opacity: this.props.isEditingItems ? 1 : 0,
                        }}
                    />
                </TouchableOpacity>
                <View
                    style={{
                        position: 'absolute',
                        left: 150,
                        top: 500,//620
                        zIndex: 3,
                        opacity: this.props.isEditingItems ? 1 : 0,
                    }}
                >
                    <Button
                    title='Complete'
                    //pass the index of the selected item to the handleComplete function
                    onPress={() => this.handleComplete()}
                    //onPress={this.handleComplete(index)}
                    />
                    <Button
                    title='Clear volumes'
                    onPress={this.handleClearVolume}
                    />
                    <Button
                    title='Delete all volumes'
                    onPress={this.deleteAllVolumes}
                    />
                </View>
                
                {
                    this.state.tableData.map((item, index) => (
                        <BouncyCheckbox
                            key={`${index}-${this.state.selectedItems.includes(index)}`}
                            isChecked={this.state.selectedItems.includes(index)}
                            style={{
                                position: 'absolute',
                                left: 20,
                                top: 90 + (index * 40),
                                zIndex: 1,
                                opacity: this.props.isEditingItems ? 1 : 0,
                            }}

                            onPress={(isChecked) => {
                                this.setState(prevState => {
                                    if (isChecked) {
                                        return {selectedItems: [...prevState.selectedItems, index]}
                                        
                                    }
                                    else {
                                        return {selectedItems: prevState.selectedItems.filter(item => item !== index)}
                                    }
                                })
                            }}
                        />
                    ))
                }   
                <Animated.View 
                style={{transform: [{translateX}]}}
                zIndex={2}
                >
                <ScrollView 
                horizontal={false}
                >
                    <View>
                        
                        <Table 
                        borderStyle={{borderWidth: 1, borderColor: '#C1C0B9'}}>
                            <Row 
                            data={state.tableHead} 
                            widthArr={state.widthArr} 
                            style={styles.header} 
                            textStyle={styles.headerText}/>
                        </Table>
                        <ScrollView style={styles.dataWrapper}>
                            <KeyboardAwareScrollView>
                                <Table borderStyle={{borderWidth: 1, borderColor: '#C1C0B9'}}>
                                    {
                                    tableData.map((tableRowData, index) => (
                                        <TableWrapper 
                                        key={index} 
                                        autogrow={true}
                                        style={[
                                            styles.row, 
                                            index%2 && {backgroundColor: '#F7F6E7'}
                                            ]}>
                                            
                                            
                                        
                                        {
                                            tableRowData.map((cellData, cellIndex) => (
                                            <Cell 
                                            key={cellIndex}
                                            multiline={true}
                                            data={
                                                cellIndex === 2 ?
                                                <TouchableOpacity onPress={
                                                    () => this.handleSxRRowPress(index)}>
                                                    <Cell
                                                    key={cellIndex}
                                                    data={tableData[index][cellIndex]}
                                                    multiline={true}
                                                    style={styles.text}
                                                    width={state.widthArr[cellIndex]}/>
                                                </TouchableOpacity>
                                                :
                                                <TextInput
                                                multiline={true}
                                                autogrow={true}
                                                height='auto'
                                                scrollEnabled={true}
                                                
                                                keyboardType={
                                                    cellIndex === 0 ? 'default' : cellIndex === 1 ? 'numeric' : cellIndex === 2 ? 'numeric' : 'default'
                                                }
                                                style={styles.text} 
                                                onChangeText={
                                                    newText => this.updateRow(newText, index, cellIndex)
                                                    }
                                                
                                                value={
                                                    cellData}/>} 
                                                width={state.widthArr[cellIndex]} />
                                                
                                            ))
                                        
                                        }
                                        </TableWrapper>
                                    ))
                                    }
                                </Table>
                            </KeyboardAwareScrollView>
                        </ScrollView>
                    </View>
                </ScrollView>
                {this.renderModal()}
            </Animated.View>

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
                            this.handleAddRow();
                        }}
                        
                    />
                </View>
            
            </View>
        );
        
        
    }
}

export default ItemScreen;

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, paddingTop: 30, backgroundColor: '#fff' },
    header: { height: 50, backgroundColor: '#537791' },
    headerText: { textAlign: 'center', flexDirection: 'row', color: 'white', fontWeight: 'bold', fontSize: 18 },
    text: { textAlign: 'center', fontWeight: 'heavy', flexDirection: 'row' },
    dataWrapper: { marginTop: -1 },
    row: {  flexDirection: 'row', height: 40, backgroundColor: '#E7E6E1' },

    //Actions styles
    actionContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        flexDirection: 'row',
        backgroundColor: 'white',
        borderWidth: 0,
    },

    actionIcon: {
        flex: 1,
        justifyContent: 'flex-end',
    },

    actionCol:  {
        backgroundColor: 'white',
    },

    //Modal styles
    modalCenteredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    },
    modalInput: {
        flexDirection: 'row',
        height: 40,
        width: 200,
        borderColor: 'black',
        borderWidth: 1,
        padding: 10,
        marginBottom: 10,
        textAlign: 'center',
        width: 50,
        height: 'auto',
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center",
        borderColor: 'black',
    }
  });