import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, RefreshControl, Dimensions, Linking, Platform, PermissionsAndroid } from 'react-native';
import { Colors } from '../../../important/Colors';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { allOrders, newOrders } from '../../Constants/DummyData';
import { ListComponent } from '../../Components/ListComponent';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../Redux/Reducers';
import { useFocusEffect } from '@react-navigation/native';
import { getRiderOrders } from '../../Redux/Reducers/Actions';
import RowSkeleton from '../../Components/Skeletons/RowSkeleton';
import { PoppinsFont } from '../../Constants/fonts';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Body from '../../Components/body/Body';
import TextHeader from '../../Components/headers/TextHeader';
import RNBluetoothClassic from 'react-native-bluetooth-classic';
import CustomButton from '../../Components/CustomButton';
import Toast from 'react-native-simple-toast';

const h = Dimensions.get('screen').height
const w = Dimensions.get('screen').width

const CurrentDeliveryScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth?.userDetails);
  const [load, setLoad] = useState(false);
  const RiderOrders = useSelector(
    (state) => state.auth?.RiderOrders,
  );
  const type = user?.email == 'kitchen@example.com' ? 'kitchen' : null;
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {

      navigation.getParent()?.setOptions({
        tabBarStyle: { display: 'flex', backgroundColor: Colors.primary },
        swipeEnabled: true,
      });
    }),
  );
  useEffect(() => {
    dispatch(getRiderOrders('shipped', user?.id, setLoad));
  }, [])

  async function requestBluetoothPermissions() {
    if (Platform.OS === 'android' && Platform.Version >= 31) {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
  
      const allGranted = Object.values(granted).every((p) => p === PermissionsAndroid.RESULTS.GRANTED);
      return allGranted;
    }
  
    return true;
  }

  const onRefresh = async () => {
    setRefreshing(true);
    dispatch(getRiderOrders('shipped', user?.id, setLoad));

    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };
//   useEffect(() => {
//     requestBluetoothPermissions()
// }, [])
  // const checkBluetooth = async () => {

  // const connectedPrinter = await RNBluetoothClassic.isBluetoothEnabled();

  //     if (!connectedPrinter) {
  //       Toast.show('Bluetooth is currently disabled', Toast.SHORT);
  //       await RNBluetoothClassic.requestBluetoothEnabled();
  //       return false;
  //     }

  //   const bondedDevices = await RNBluetoothClassic.getBondedDevices();
  //   // const bondedDevices = await RNBluetoothClassic.openSettings();

  //   if (!bondedDevices || bondedDevices?.length === 0) {
  //     Toast.show('No paired Bluetooth printer found. Please pair one.', Toast.SHORT);
  

  //     if (Platform.OS === 'android') {
  //        RNBluetoothClassic.openBluetoothSettings()
  //       // Linking.openSettings();
  //     } else {
  //       Linking.openURL('App-Prefs:root=Bluetooth');
  //     }
  
  //     return false;
  //   }
  
  //   if (bondedDevices?.length > 1) {
  //     Toast.show(
  //       'Multiple Bluetooth devices found. Please unpair others to avoid conflict.',
  //       Toast.LONG
  //     );
  
  //     if (Platform.OS === 'android') {
  //        RNBluetoothClassic.openBluetoothSettings()
  //       // Linking.openSettings();
  //     } else {
  //       Linking.openURL('App-Prefs:root=Bluetooth');
  //     }
  
  //     return false;
  //   }
  // }

  return (
    <Body>
      <TextHeader title={'Current Orders'} />

      {/* <CustomButton 
      onPress={checkBluetooth}
      /> */}
      {load ? (
        <View style={{ flex: 1, marginTop: verticalScale(10) }}>
          <RowSkeleton />
          <RowSkeleton />
          <RowSkeleton />
        </View>
      ) : (
        <FlatList
          style={{ flex: 1, marginTop: verticalScale(10) }}
          data={RiderOrders}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => {
            return (
              <ListComponent
                item={item}
                onPress={() =>
                  navigation.navigate('Order Details', { order: item, type })
                }
              />
            );
          }}

          contentContainerStyle={{ paddingHorizontal: 1 }}
          refreshControl={
            <RefreshControl
              onRefresh={onRefresh}
              refreshing={refreshing}
            />
          }

          ListEmptyComponent={() => {
            return (
              <View style={{ height: h / 1.5, width: w, justifyContent: 'center', alignItems: 'center' }}>
                <MaterialCommunityIcons
                  name="file-search-outline"
                  color={Colors.primary}
                  size={80}
                />
                <Text
                  style={{
                    alignSelf: 'center',
                    fontFamily: PoppinsFont.Poppins600,
                    color: 'black',
                    fontSize: 14,
                    marginTop: 15
                  }}>No Current Delivery</Text>
              </View>
            )
          }}
        />
      )}
    </Body>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundColor,
    justifyContent: 'center',
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
});

export default CurrentDeliveryScreen;
