// DetailsScreen.js
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import React, { Component, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TextInput, Button } from 'react-native';
import { Table, TableWrapper, Row, Rows, Col, Cols, Cell } from 'react-native-reanimated-table';
import { PageScrollView } from 'pagescrollview'
import Icon from 'react-native-vector-icons/FontAwesome';
import { TouchableOpacity } from 'react-native-web';

const addRow = (data, setData, itemIndex) => {
  const newData = [...data];
  newData[itemIndex].table.push({col1: '', col2: '', col3: '', col4: '', col5: ''});
  setData(newData);
  AsyncStorage.setItem('@storage_Key', JSON.stringify(newData));
};


const DetailsScreen = ({route, navigation}) => {
  const [data, setData] = useState([]);
  const {itemIndex} = route.params;

  //handles text change in table
  const handleTextChange = (text, index, col) => {
    const newData = [...data];
    newData[itemIndex].table[index][col] = text;
    setData(newData);
    AsyncStorage.setItem('@storage_Key', JSON.stringify(newData));
  };

  
  //stores table into async storage
  useEffect(() => {
    const getData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('@storage_Key');
        if (storedData != null) {
          let parsedData = JSON.parse(storedData);
          if (!parsedData[itemIndex].table) {
            parsedData[itemIndex].table = [{col1: '', col2: '', col3: '', col4: '', col5: ''}];
          }
            setData(parsedData);
        }
      } catch (error) {
        console.error(error);
      }
    };
    // title of the page set to item label
    navigation.setOptions({title: data[itemIndex] ? data[itemIndex].label : 'Loading...'})
    getData();
  }, [data, itemIndex]);
  
  return (
    <PageScrollView>
      <View style={styles.container}>
        {data && data[itemIndex] && data[itemIndex].table && (
            <Table borderStyle={styles.table}>
              <TableWrapper style={styles.head}>
                {
                  ['Excercise', 'lbs', 'S x R', 'Notes'].map((column, colIndex) => (
                    <Cell 
                      key={colIndex} 
                      data={column}
                      textStyle={styles.headText}
                      style={colIndex === 0 ? styles.exerciseCell : colIndex === 1 ? styles.weightCell : colIndex === 2 ? styles.setsxrepsCell : colIndex === 3 ? styles.notesCell : null}
                    />
                  ))
                }
              </TableWrapper> 
              {
                data[itemIndex].table.map((rowData, index) => (
                  <TableWrapper key={index} style={styles.row}>
                    {
                      ['col1', 'col2', 'col3', 'col4'].map((column, colIndex) => (
                        <Cell 
                          key={colIndex} 
                          textStyle={styles.text}
                          style={colIndex === 0 ? styles.exerciseCell : colIndex === 1 ? styles.weightCell : colIndex === 2 ? styles.setsxrepsCell : colIndex === 3 ? styles.notesCell : null}
                          data={
                            <TextInput 
                              style={styles.textInput}
                              value={rowData[column]} 
                              multiline={true}
                              onChangeText={(text) => handleTextChange(text, index, column)}
                            />
                          } 
                        />
                      ))
                    }
                  </TableWrapper>
                ))
              }
            </Table>
        )}
        <Button title="Add Row" onPress={() => addRow(data, setData, itemIndex)} />
      </View>
    </PageScrollView>
  );
  
};


export default DetailsScreen;


const styles = StyleSheet.create({
  container: { 
    flex: 1,
    padding: 16, 
    paddingTop: 30, 
    backgroundColor: '#fff' 
  },

  exerciseCell: {
    flex: 2,
  },

  weightCell:{
    flex: 1,
  },
  
  setsxrepsCell:{
    flex: 1,
  },

  notesCell:{
    flex: 2,
  },

  head: { 
    flexDirection: 'row',
    flexWrap: 'nowrap',
    minHeight: 40,
    borderColor: 'black',
    borderBlockColor: 'black',
    backgroundColor: '#f1f8ff', 
    borderBottomWidth: 2,
    borderTopWidth: 2,
  },

  textInput: {
    minHeight: 30,
    margin: 2,
    lineHeight: 20,
    flexWrap: 'wrap',
    flexShrink: 1,
  },

  headText: {
    margin: 0,
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 18,
    maxWidth: 100,

  },

  text: { 
    textAlign: 'center',
    margin: 6,
    color: 'black',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    maxWidth: 100,
   },

  dataWrapper: {
    marginTop: 1,
  },

  row: { 
    flexDirection: 'row',
    flexWrap: 'wrap', 
    backgroundColor: 'white', 
    minHeight: 30,
  },

  cell: {
    // Apply border to only one side of the cell
    borderRightWidth: 2,
    borderColor: 'black',
  },
  table: {
    // Apply border to the entire table
    borderWidth: 1,
    borderColor: '#C1C0B9',
  },
});