import React from 'react';
import {StyleSheet, View, Text, FlatList, TouchableOpacity} from 'react-native';
import {Colors} from '../../Constants/Colors';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import {allOrders, newOrders} from '../../Constants/DummyData';
import { ListComponent } from '../../Components/ListComponent';
import { useSelector } from 'react-redux';
import { RootState } from '../../Redux/Reducers';

const CurrentDeliveryScreen: React.FC = ({navigation}) => {
  const user = useSelector((state:RootState)=> state.auth?.userDetails);
  const type = user?.email == "kitchen@example.com" ? "kitchen" : null;

  
  return (
    <View style={styles.container}>
      {/* <FlatList
        style={{flex: 1, marginTop:verticalScale(10)}}
        data={newOrders}
        renderItem={({item}) => (
         <ListComponent
         item={item}
         onPress={()=> navigation.navigate("Order Details", {order:item, type})}
         />
        )}
      /> */}
      <View style={styles.titleText}>
      <Text>No Current Delivery</Text>

      </View>
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
