import React, {useCallback} from 'react';
import {StyleSheet, View, FlatList, Text} from 'react-native';
import {Colors} from '../../../important/Colors';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import {ListComponent} from '../../Components/ListComponent';
import {useFocusEffect} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {getOrders} from '../../Redux/Reducers/Actions';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const CompletedOrdersScreen = ({navigation}) => {
  const dispatch = useDispatch();

  const user = useSelector(state => state.auth?.userDetails);
  const completedOrders = useSelector(state => state.auth?.completedOrders);

  const type = user?.role_id == '1' ? 'kitchen' : null;

  useFocusEffect(
    useCallback(() => {
      navigation.getParent()?.setOptions({
        tabBarStyle: {display: 'flex', backgroundColor: Colors.primary},
        swipeEnabled: true,
      });

      dispatch(getOrders('delivered'));
    }, []),
  );
  // console.log('completedOrders', completedOrders);
  return (
    <View style={styles.container}>
      <FlatList
        style={{flex: 1, marginTop: verticalScale(10)}}
        data={completedOrders}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item}) => (
          <ListComponent
            item={item}
            onPress={() =>
              navigation.navigate('Order Details', {order: item, type})
            }
          />
        )}
        ListEmptyComponent={
          <View
            style={{
              flex: 1,
              marginTop: '80%',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <MaterialCommunityIcons
              name="file-search-outline"
              color={Colors.primary}
              size={80}
            />
            <Text
              style={{
                alignSelf: 'center',
                marginTop: 15,
                fontSize: 18,
              }}>
              No Complete Order
            </Text>
          </View>
        }
      />
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
  inputStyles: {
    marginVertical: scale(20),
  },
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

export default CompletedOrdersScreen;
