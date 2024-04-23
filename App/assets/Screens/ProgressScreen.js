import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Collapsible from 'react-native-collapsible';
import { ScrollView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart } from "react-native-chart-kit"
import { useFocusEffect } from '@react-navigation/native';

const chartConfig = {
    backgroundGradientFrom: "#FFFFFF",
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: "#FFFFFF",
    backgroundGradientToOpacity: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // optional, sets the color of the lines, defaults to rgba(0,0,0,1)
    strokeWidth: 2, // optional, defaults to 3
    barPercentage: 0.5,
    useShadowColorFromDataset: false, // optional
    fillShadowGradient: 'transparent',
    yAxisLabel: 'vol',
    decimalPlaces: 0,
    
};



const ProgressScreen = () => {
    const [collapsedCardIndeces, setCollapsedCardIndeces] = useState([]);
    const [storedData, setStoredData] = useState([]);
    const [tableData, setTableData] = useState(null);
    const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const chartWidth = 30 * labels.length;
    const [exerciseVolumesData, setExerciseVolumesData] = useState([]);

    


    //get stored data
    useFocusEffect(
        React.useCallback(() => {
            const getData = async () => {
                try {
                    const storedData = await AsyncStorage.getItem('@storage_Key');
                    if (storedData != null) {
                        const parsedData = JSON.parse(storedData);
                        setStoredData(parsedData);
                        setCollapsedCardIndeces(new Array(parsedData.length).fill(true));
                    
                        //get data 
                        const tableDataArray = [];
                        const volumesArray = [];
                        for (let item of parsedData) {
                            //get table data
                            const itemKey = `@storage_Key_${item.value}`;
                            const tableDataFromStorage = await AsyncStorage.getItem(itemKey);
                            if (tableDataFromStorage != null) {
                                const parsedTableData = JSON.parse(tableDataFromStorage);
                                tableDataArray.push(parsedTableData);

                                //get volumes for each exercise
                                for (let exercise of parsedTableData) {
                                    if (exercise != null || exercise != '') {
                                        const exerciseName = exercise[0];
                                        const volumeKey = `@volume_${item.value}_${exerciseName}`;
                                        const volumesFromStorage = await AsyncStorage.getItem(volumeKey);
                                        if (volumesFromStorage != null) {
                                            const parsedVolumes = JSON.parse(volumesFromStorage);
                                            volumesArray.push({exercise: exerciseName, volumes: parsedVolumes});
                                        }
                                    }
                                }
                            }
                        }
                        setTableData(tableDataArray);
                        setExerciseVolumesData(volumesArray);

                    }  

                } catch (error) {
                    console.log(error);
                }
                
            };
            getData();
            return () => {}; 
        }, [])
    );

    

    //random color generator
    let hue = Math.random();
    const golden_ratio_conjugate = 0.618033988749895;

    const getRandomColor = () => {
        hue += golden_ratio_conjugate;
        hue %= 1;
        const h = Math.floor(hue * 360);
        return `hsl(${h}, 60%, 70%)`;
    };


    
    //generate data sets
    const generateDataSets = (tableData) => {
        const dataSets = [];
    
        if (tableData != null) {
            for (let i = 0; i < tableData.length; i++) {
                const item = tableData[i];
                const lineData = [];
    
                if (item != null) {
                    for (let j = 0; j < item.length; j++) {
                        let currentColor = getRandomColor();
                        const exerciseName = item[j][0];
    
                        // Find the exercise in exerciseVolumesData
                        const exerciseData = exerciseVolumesData.find(exercise => exercise.exercise === exerciseName);
    
                        // If the exercise is found, use its volumes as data, otherwise use an empty array
                        const data = exerciseData ? exerciseData.volumes : [];
    
                        const dataSet = {
                            data: data,
                            color: (opacity = 1) => currentColor,
                            strokeWidth: 2, // optional
                        }
                        lineData.push(dataSet);
                    }
                }
                
                dataSets.push(lineData);
            }
        }
        return dataSets;
    };

   

    //generate legends    
    const generateLegends = (tableData) => {
        const legends = [];
        if (tableData != null) {
            for (let item of tableData) {
                const itemLegends = [];
                if (item != null) {
                    for (let row of item) {
                        itemLegends.push(String(row[0]));
                    }
                }
                legends.push(itemLegends);
            }
        }
        return legends;
    };

    const toggleCard = (index) => {
        setCollapsedCardIndeces(prevState => prevState.map((item, i) => i === index ? !item : item));
    }

    return (
        <View
        style={{flex: 1}}>
            <ScrollView style={{
                paddingTop: 50,
                paddingLeft: 20,
                paddingRight: 20,
                }}>

                {storedData && storedData.map((item, index) => {
                    
                    const legends = generateLegends(tableData);
                    const dataSet = generateDataSets(tableData);
                    
                    if (!dataSet[index] || !legends[index]) {
                        return null;
                    }
                    const data = {
                        labels: (dataSet[index] && dataSet[index][0]) ? dataSet[index][0].data.map((_, i) => `Ses ${i + 1}`) : [],
                        datasets: dataSet[index] || [],
                        legend: legends[index] || [],
                        
                    };

                    return (
                            
                        <View
                        key={index}
                        style={{
                            justifyContent: 'flex-start',
                            alignItems: 'flex-start',
                            marginTop: 10,
                        }}
                        >
                            
                            <TouchableOpacity 
                            onPress={() => {
                                toggleCard(index);
                                
                            }}
                                
                            style={{
                                backgroundColor: 'rgba(255, 165, 0, 0.6)',
                                padding: 10,
                                width: '100%',
                                borderRadius: 10,
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderColor: 'black',
                                borderWidth: 1.5,
                            }}
                            >
                                <Text
                                style={{
                                    fontSize: 20,
                                    fontWeight: 'bold',
                                    alignItems: 'center',
                                    lineHeight: 30,
                                    letterSpacing: 2,
                                    textShadowColor: 'white',
                                    textShadowOffset: {width: -1, height: 1},
                                    textShadowRadius: 10,
                                }}
                                >
                                    {item.label}</Text>
                            </TouchableOpacity>
                            <Collapsible
                                collapsed={collapsedCardIndeces[index]}
                            >
                                <ScrollView horizontal={true}>

                                    {tableData && data && data.datasets && data.labels && data.legend &&
                                        <LineChart
                                        data={data}
                                        width={chartWidth}
                                        height={220}
                                        chartConfig={chartConfig}
                                        withDots={true}
                                        withShadow={false}
                                    />}
                                </ScrollView>
                            </Collapsible>

                        </View>
                    );
                })}
            </ScrollView>
        </View>

    );
}





export default ProgressScreen;