import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Colors } from '../../../important/Colors';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { allOrders, newOrders } from '../../Constants/DummyData';
import { DepartmentList } from '../../Components/DepartmentList';
import CustomButton from '../../Components/CustomButton';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getDepartment,
} from '../../Redux/Reducers/Actions';
import TextHeader from '../../Components/headers/TextHeader';
import RowSkeleton from '../../Components/Skeletons/RowSkeleton';





const SettingsScreen = ({ navigation }) => {

  const [departments, setDepartments] = useState([]);
  const [selectedDepartments, setselectedDepartments] = useState([]);
  const [loader, setLoader] = useState(false);

  const [kitchenSlip, setkitchenSlip] = useState(false)


  const dispatch = useDispatch();


  const handleLogOut = async () => {
    await AsyncStorage.removeItem('user')
    const loginAction = {
      type: 'LOGIN',
      payload: null,
    };

    dispatch(loginAction);
  };

  useEffect(() => {
    getinitialData()
  }, [])

  const getinitialData = async () => {
    setLoader(true)
    await dispatch(getDepartment(setDepartments))
    const departmentsData = await AsyncStorage.getItem('Departments');
    const parsedDepartments = departmentsData
      ? JSON.parse(departmentsData)
      : [];
    setselectedDepartments(parsedDepartments)
    const kitchenSlip = await AsyncStorage.getItem('kitchenSlip');
    setkitchenSlip(kitchenSlip === 'true' ? true : false);
    setLoader(false)

  }

  const handleSaveDepartments = async (type, department) => {
    setselectedDepartments(prev => {
      let updatedDepartments;

      if (type === 'add') {
        updatedDepartments = [...prev, department.id];
      } else {
        updatedDepartments = prev.filter(item => item !== department.id);
      }
      AsyncStorage.setItem('Departments', JSON.stringify(updatedDepartments));
      return updatedDepartments;
    });
  };

  const toggleKitchenSlip = async (status) => {
    setkitchenSlip(status);
    AsyncStorage.setItem('kitchenSlip', status ? "true" : "false");
  }




  return (
    <View style={styles.container}>
      <TextHeader title={'Settings'} />
      <View style={styles.DepartmentContainer}>
        <Text style={styles.DepartmentTittle}>Select Departments</Text>
        {
          loader ?
            <>
              <RowSkeleton />
              <RowSkeleton />
            </>
            :
            <FlatList
              data={departments}
              renderItem={({ item }) => (
                <DepartmentList
                  item={item}
                  onPress={(type, item) => handleSaveDepartments(type, item)}
                  selectedDepartments={selectedDepartments}
                />

              )}
            />
        }
      </View>

      {
        !loader &&
        <View style={styles.settings}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.DepartmentTittle}>Auto Print Kitchen Slip</Text>
            <TouchableOpacity onPress={() => toggleKitchenSlip(!kitchenSlip)} style={{ backgroundColor: kitchenSlip ? 'lightgreen' : "#FA6E6E", borderRadius: 5, marginRight: 15, marginVertical: 5 }}><Text style={[styles.DepartmentTittle]}>{kitchenSlip ? "Turned On" : "Turned Off"}</Text></TouchableOpacity>
          </View>
        </View>
      }
      <TouchableOpacity onPress={() => navigation.navigate('Inventory')} style={styles.settings}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.DepartmentTittle}>Pick Stock</Text>
        </View>
      </TouchableOpacity>

      {/* <View style={styles.settings}>
        <Text style={styles.DepartmentTittle}>Auto Print Order Slip</Text>
      </View> */}


      <CustomButton
        title='Logout'
        onPress={handleLogOut}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: '',
    backgroundColor: Colors.backgroundColor,
    justifyContent: 'flex-start',
  },
  titleText: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: moderateScale(20),
  },
  inputStyles: { marginVertical: scale(20) },
  card: {
    marginHorizontal: 20,
    backgroundColor: Colors.textLighestGrey,
    paddingHorizontal: moderateScale(15),
    paddingVertical: moderateScale(20),
    borderRadius: scale(10),
    shadowOffset: {
      height: scale(10),
      width: scale(5),
    },
    shadowColor: Colors.iconBackground,
    shadowOpacity: 1,
  },
  title: {
    color: Colors.iconBackground,
  },
  DepartmentContainer: {
    height: 250,
    marginTop: 20,
    borderBottomWidth: .5,
    borderColor: 'lightgray'
  },
  DepartmentTittle: {
    padding: 20,
    fontSize: 17,
    fontWeight: '600',
    color: '#000'
  },
  settings: {
    borderBottomWidth: .5,
    borderColor: 'lightgray',
  }
});

export default SettingsScreen;
