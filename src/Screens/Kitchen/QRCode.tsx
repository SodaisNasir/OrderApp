import React from 'react';
import {View, Text, StyleSheet, FlatList} from 'react-native';
import {Colors} from '../../Constants/Colors';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import CustomButton from '../../Components/CustomButton';
import QRCode from 'react-native-qrcode-svg';

const QRCodeScreen: React.FC = ({navigation, route}) => {
  const order = route.params.order;
  const accountType = route.params.type;
  console.log('accountType', accountType);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={{alignSelf: 'center'}}>
          <Text
            style={styles.title}>
            {order.orderNumber}
          </Text>
        </View>
        <View style={{alignItems: 'center', justifyContent: 'center', marginVertical:verticalScale(60)}}>
          <QRCode
            value="http://awesome.link.qr"
            size={scale(240)}
            // logoSize={600}
            // logoBackgroundColor='red'
            backgroundColor={Colors.textLighestGrey}
            color={Colors.textBlue}
          />
        </View>
        <Text style={[styles.title,{alignSelf:'center'}]}>Scane to Deliver</Text>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(10),
    flex: 1,
    backgroundColor: Colors.backgroundColor,
  },
  titleText: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: moderateScale(20),
  },
  inputStyles: {marginVertical: scale(20)},
  card: {
    flex: 0.8,
    marginHorizontal: scale(20),
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
    //   alignItems:"center"
  },
  title: {
    fontSize: scale(20),
    fontWeight: 'bold',
    color: Colors.textBlue,
  },
});
export default QRCodeScreen;
