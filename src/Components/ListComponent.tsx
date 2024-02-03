import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {scale} from 'react-native-size-matters';
import {Colors} from '../Constants/Colors';

interface ListComponentProps {
  item: object;
  onPress: () => void;
}

export const ListComponent: React.FC<ListComponentProps> = ({item, onPress}) => {
  // console.log('item.Shipping_postal_code', item)
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.list,{ backgroundColor: item.status == "neworder" ? Colors.textLighestGrey
        : item.status == 'pending'
        // : item.status == 'inprogress'
          ? Colors.primaryOrg
          : Colors.lightprimary
         }]}>
      <View>
        <Text
          style={{
            fontSize: scale(12),
            color: item.status != "neworder"  ? Colors.backgroundColor : Colors.textBlue,
          }}>
          {item.id}
        </Text>
        <Text
          style={{
            fontSize: scale(8),
            color: item.status != "neworder" ? Colors.backgroundColor : Colors.textBlackColor,
          }}>
          {item.Shipping_postal_code} 
          {/* {item?.Shipping_address} */}
        </Text>
      </View>
      <View>
        <Text
          style={{
            fontSize: scale(12),
            color: item.status != "neworder" ? Colors.backgroundColor : Colors.textBlue,
          }}>{`€${item.order_total_price}`}</Text>
        <Text
          style={{
            fontSize: scale(8),
            color:item.status != "neworder" ? Colors.backgroundColor : Colors.textBlackColor,
          }}>
          {item.date}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles =StyleSheet.create({
list:{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: scale(5),
    marginHorizontal: scale(20),
    borderRadius: scale(5),
    paddingHorizontal: scale(10),
    paddingVertical: scale(15),
  }
})