import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
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

  const onRefresh = async () => {
    setRefreshing(true);
    dispatch(getRiderOrders('shipped', user?.id, setLoad));

    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  return (
    <Body>
      <TextHeader title={'Current Orders'} />
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
