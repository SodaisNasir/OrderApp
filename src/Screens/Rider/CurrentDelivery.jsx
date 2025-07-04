import React, { useCallback, useState } from 'react';
import {StyleSheet, View, Text, FlatList, TouchableOpacity, RefreshControl} from 'react-native';
import {Colors} from '../../../important/Colors';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import {allOrders, newOrders} from '../../Constants/DummyData';
import { ListComponent } from '../../Components/ListComponent';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../Redux/Reducers';
import { useFocusEffect } from '@react-navigation/native';
import { getRiderOrders } from '../../Redux/Reducers/Actions';

const CurrentDeliveryScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth?.userDetails);
  const [load, setLoad] = useState(false);
  const RiderOrders = useSelector(
    (state) => state.auth?.RiderOrders,
  );
  const type = user?.email == 'kitchen@example.com' ? 'kitchen' : null;
  const [refreshing, setRefreshing] = useState(false);

  console.log('RiderOrders', RiderOrders)
  console.log('user', user)
  
  
  useFocusEffect(
    useCallback(() => {
      dispatch(getRiderOrders('shipped', user?.id, setLoad));
       navigation.getParent()?.setOptions({
              tabBarStyle: {display: 'flex', backgroundColor: Colors.primary},
              swipeEnabled: true,
            });
    }, []),
  );


  
 const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(getRiderOrders('shipped',user?.id, setLoad));
    setRefreshing(false);
  };

  
  return (
    <View style={styles.container}>
      {/* {load ? (
        <View style={{flex: 1, marginTop: verticalScale(10)}}>
          <RowSkeleton />
          <RowSkeleton />
          <RowSkeleton />
        </View>
      ) : ( */}
        <FlatList
          style={{flex: 1, marginTop:verticalScale(10)}}
          data={RiderOrders}
          showsVerticalScrollIndicator={false}
          renderItem={({item, index}) => {
            return (
              <ListComponent
                item={item}
                onPress={() =>
                  navigation.navigate('Order Details', {order: item, type})
                }
              />
            );
          }}
          ListEmptyComponent={() => <Text style={{alignSelf:'center'}}>No Current Delivery</Text>}
          contentContainerStyle={{paddingHorizontal: 1}}
          refreshControl={
            <RefreshControl
              onRefresh={onRefresh}
              // refreshing={refreshing}
            />
          }
        />
      {/* )} */}
    </View>
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
  inputStyles: {marginVertical: scale(20)},
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
