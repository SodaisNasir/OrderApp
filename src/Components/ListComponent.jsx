import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {scale} from 'react-native-size-matters';
import {Colors} from '../../important/Colors';
import {imageUrl} from '../../important/Urls';
import DefaultImg from '../assets/tab/deal.jpg';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { PoppinsFont } from '../Constants/fonts';

export const ListComponent = ({item, onPress}) => {
  const productImg = item?.order_details?.product?.[0]?.product_details?.img;
  const dealImg = item?.order_details?.deals?.[0]?.deal_details?.deal_image;

  const productName = item?.order_details?.product?.[0]?.product_name;
  const dealName = item?.order_details?.deals?.[0]?.deal_details?.deal_name;
  // console.log('productName', productName);

  const image_Url = productImg || dealImg;
  const pro_names = productName || dealName;


  // console.log('item?.payment_status', item?.payment_status)
  return (
    <TouchableOpacity onPress={onPress} style={styles.mainCon} activeOpacity={0.6}>
      <LinearGradient
        colors={
          // item.status == 'neworder'
          //   ?
          ['#fff', '#f5f5f5']
          // : item.status == 'pending'
          // ? ['#EE8000', '#FF9F00']
          // : ['#00D859', '#22C55E']
        }
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={[
          styles.list,
          // {
          //   backgroundColor:
          //     item.status == 'neworder'
          //       ? Colors.white
          //       : item.status == 'pending'
          //       ? // : item.status == 'inprogress'
          //         Colors.primaryOrg
          //       : Colors.lightprimary,
          //
          // },
        ]}>
        {/* <View>
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
          {item?.Shipping_address}
        </Text>
      </View> */}
        <View
          style={[
            styles.payment_box,
            {
              backgroundColor:
                item.payment_status == 'unpaid' ? Colors.secondary : '#0E6147',
            },
          ]}>
          <Text style={styles.id_text}>{item?.payment_status}</Text>
        </View>
        <View style={styles.wrapper_img}>
          <View style={styles.pro_image}>
            <Image
              style={{height: '100%', width: '100%'}}
              source={image_Url ? {uri: `${imageUrl}${image_Url}`} : DefaultImg}
            />
          </View>
          <View style={{justifyContent: 'center'}}>
            <Text
              style={{
                color: Colors.black,
                fontSize: 14,
                fontFamily: PoppinsFont.Poppins600,
                // width: '85%'
              }}
              numberOfLines={1}
              >
              {pro_names}
            </Text>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Ionicons
                name="location-outline"
                size={scale(15)}
                color={Colors.textLighestGrey}
              />
              <Text
                style={[
                  styles.pro_text,
                  {
                    color: Colors.textLighestGrey,
                  },
                ]}>
                {item?.Shipping_postal_code}
              </Text>
            </View>
            <Text
              style={{
                fontSize: scale(14),
                color: Colors.textBlue,
              }}>{`€${item.order_total_price}`}</Text>
          </View>
        </View>
        {/* <View>
          <Text
            style={{
              fontSize: scale(12),
              color:
                item.status != 'neworder'
                  ? Colors.backgroundColor
                  : Colors.textBlue,
            }}>{`€${item.order_total_price}`}</Text>
          <Text
            style={{
              fontSize: scale(8),
              color:
                item.status != 'neworder'
                  ? Colors.backgroundColor
                  : Colors.textBlackColor,
            }}>
            {item?.delivered_at}
          </Text>
        </View> */}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  mainCon:{
    backgroundColor: 'white',
    overflow: 'hidden',
    elevation: 2.5,
    marginVertical: scale(8),
    marginHorizontal: scale(20),
    borderRadius: 10,
  },
  list: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // marginVertical: scale(8),
    // marginHorizontal: scale(20),
    // borderRadius: scale(5),
    // paddingHorizontal: scale(10),
    // paddingVertical: scale(15),
    position: 'relative',
    overflow: 'hidden',
    // elevation: 2.5,
  },
  payment_box: {
    position: 'absolute',
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 99,
    justifyContent: 'center',
    alignItems: 'center',
    right: 0,
    top: 0,
    borderBottomLeftRadius: 5,
  },
  id_text: {
    fontSize: 13,
    color: Colors.white,
  },
  pro_image: {
    height: 80,
    width: 100,
  },
  wrapper_img: {
    gap: 5,
    flexDirection: 'row',
  },
  pro_text: {
    fontSize: 10,
  },
});
