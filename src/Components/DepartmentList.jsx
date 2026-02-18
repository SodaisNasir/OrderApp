import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { scale } from 'react-native-size-matters';
import { Colors } from '../../important/Colors';


export const DepartmentList = ({ item, onPress , selectedDepartments }) => {

  console.log("selectedDepartments", selectedDepartments)

  return (
    <TouchableOpacity onPress={()=> onPress(selectedDepartments.includes(item.id) ? 'remove': 'add', item)} style={[styles.mainCon,{backgroundColor: selectedDepartments.includes(item.id) ? Colors.primaryLight : 'white'}]}>
        <Text style={[styles.depatment_tittle,{color: selectedDepartments.includes(item.id) ? 'white' : 'gray'}]}>{item.department_name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  mainCon: {
    overflow: 'hidden',
    elevation: 2.5,
    marginVertical: scale(8),
    marginHorizontal: scale(20),
    borderRadius: 10,
    width:'89%',
  },

  depatment_tittle:{
    padding:10
  }
 
});
