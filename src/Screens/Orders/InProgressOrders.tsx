import React, {useCallback} from 'react';
import {StyleSheet, View, Text, FlatList} from 'react-native';
import {Colors} from '../../Constants/Colors';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import {allOrders, newOrders} from '../../Constants/DummyData';
import {ListComponent} from '../../Components/ListComponent';
import {useFocusEffect} from '@react-navigation/native';
import {useSelector} from 'react-redux';

const InProgressOrdersScreen: React.FC = ({navigation}) => {
  const user = useSelector((state: RootState) => state.auth?.userDetails);
  const inprogressOrders = useSelector((state: RootState) => state.auth?.pendingOrders);
  const type = user?.role_id == '1' ? 'kitchen' : null;

  useFocusEffect(
    useCallback(() => {
      navigation.getParent()?.setOptions({
        tabBarLabelStyle: {fontSize: scale(8), color: Colors.backgroundColor},
        // tabBarItemStyle: { width: },
        tabBarStyle: {backgroundColor: Colors.primary},
        tabBarActiveTintColor: 'red',

        tabBarIndicatorStyle: {
          backgroundColor: 'red',
        },
        swipeEnabled: true,
      });
    }),
  );
  return (
    <View style={styles.container}>
      <FlatList
        style={{flex: 1, marginTop: verticalScale(10)}}
        data={inprogressOrders}
        renderItem={({item}) => (
          <ListComponent
            item={item}
            onPress={() =>
              navigation.navigate('Order Details', {order: item, type})
            }
          />
        )}
        ListEmptyComponent={
          <View style={{alignItems: 'center', justifyContent: 'center',}}>
            <Text>No Orders</Text>
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

export default InProgressOrdersScreen;
