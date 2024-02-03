import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  ScrollView,
} from 'react-native';
import React from 'react';


const NewOrderDetail = ({navigation, route}) => {
    const {order,type} = route.params;
    console.log('order', order)
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      <ScrollView>
        <View
          style={{
            height: 80,
            // backgroundColor:'red',
            marginTop: 10,
            flexDirection: 'row',
          }}>
          <View
            style={{
              flex: 0.4,
              justifyContent: 'center',
              alignItems: 'flex-end',
            }}>
            <View
              style={{
                height: 70,
                width: 70,
                //   borderRadius: 100,
                overflow: 'hidden',
              }}>
              <Image
                resizeMode="cover"
                style={{
                  height: '100%',
                  width: '100%',
                }}
                source={require('../../Constants/Images/ic_launcher_round.png')}
              />
            </View>
          </View>
          <View style={{flex: 0.6, justifyContent: 'center'}}>
            <Text
              style={{
                //   paddingLeft: 5,
                fontSize: 17,
                color: 'black',
                fontWeight: '800',
              }}>
              pizzablitzöstringen.de
            </Text>
          </View>
        </View>

        {/* <View style={{height: 10}} /> */}
        <Text style={styles.text1}>Kuhngasse 1, 76684 Östringen</Text>
        <Text style={styles.text1}>Östringen, Tell:0725326560-61</Text>
        <Text style={styles.text1}>Befehl no: {order?.id}</Text>
        <Text style={styles.text1}>{order?.created_at}</Text>
        <Text style={styles.text1}>Phone: +4917682540212</Text>
        <Text style={styles.text1}>Email: Jonas.bender.1@web.de</Text>
        <Text style={styles.text1}>Address:</Text>
        <Text style={styles.text1}>Name: {order?.Shipping_address}</Text>
        <Text style={styles.text1}>{order?.Shipping_address_2} {order?.Shipping_city}</Text>
        <Text style={styles.text1}>{order?.Shipping_postal_code}</Text>
        <Text style={styles.text1}>{order?.Shipping_area}</Text>
        <Text style={styles.text1}>{order?.addtional_notes}</Text>

        <Text style={[styles.text2, {textAlign: 'center', marginTop: 15}]}>
          Befehl Einzelheiten*
        </Text>
        <View
          style={{
            flex: 1,
            paddingHorizontal: 15,
          }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <Text style={styles.text2}>Qty Menge</Text>
            <Text style={styles.text2}>Preis</Text>
          </View>

         
            {
                order?.order_details?.product?.map((item,index) => {
                    const originalPrice = Number(item?.product_details?.price);
const discountPercentage = Number(item?.product_details?.discount) / 100;
const discountedPrice = originalPrice - (originalPrice * discountPercentage);
const dressngData = JSON.parse(item?.dressing)
// console.log('dressngData', dressngData)
// console.log("Original Price: $" + originalPrice);
// console.log("Discounted Price: $" + discountedPrice);
                    return(
                        <View
                        key={index}
                        style={{
                          flexDirection:'row',
                          padding:5,
                          marginTop:2
                        }}
                        >
            <View style={{height:'100%',width:'10%',alignItems:'flex-start'}}>
                <Text style={styles.text3}>X{item?.qty}</Text>
            </View>
            <View style={{height:'100%',width:'70%'}}>
            <Text style={styles.text4}>{item?.product_details?.name}</Text>
            {
                dressngData?.length > 0 && 
                dressngData?.map((elm,indx) => {
                    return(
                        <Text key={indx} style={styles.text5}>{elm?.dressing_name}</Text>
                    )
                })
            }
            </View>
            <View style={{height:'100%',width:'20%',alignItems:'flex-end'}}>
            <Text style={styles.text3}>€{discountedPrice}</Text>
            </View>
            </View>
                    )
                })
            }
          <View 
          style={{
            flexDirection:'row',
            justifyContent:'space-between',
            alignItems:'center'
          }}
          >
          <Text style={[styles.text2, {marginTop: 15}]}>
          Zwischensumme:
        </Text>
          <Text style={[styles.text2, {marginTop: 15}]}>
          €{Number(order?.order_total_price - order?.Shipping_Cost).toFixed(2)}
        </Text>
          </View>
          <View 
          style={{
            flexDirection:'row',
            justifyContent:'space-between',
            alignItems:'center'
          }}
          >
          <Text style={[styles.text2, {marginTop: 15}]}>
          Lieferladegeräte:
        </Text>
          <Text style={[styles.text2, {marginTop: 15}]}>
          €{Number(order?.Shipping_Cost).toFixed(2)}
        </Text>
          </View>
          <View 
          style={{
            flexDirection:'row',
            justifyContent:'space-between',
            alignItems:'center'
          }}
          >
          <Text style={[styles.text2, {marginTop: 15}]}>
          Gesamt:
        </Text>
          <Text style={[styles.text2, {marginTop: 15}]}>
          €{Number(order?.order_total_price).toFixed(2)}
        </Text>
          </View>
          <View 
          style={{
            flexDirection:'row',
            justifyContent:'space-between',
            alignItems:'center'
          }}
          >
          <Text style={[styles.text2, {marginTop: 15}]}>
          Number(order?.Shipping_Cost):
        </Text>
          <Text style={[styles.text2, {marginTop: 15}]}>
         {order?.payment_type}
        </Text>
          </View>
            

            <View style={{marginVertical:40}}>
            <Text style={[styles.text2, {textAlign:'center'}]}>
            Danke für Ihren Einkauf*
        </Text>
            </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  text1: {
    color: '#000000',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 3,
    fontFamily: 'OpenSans-SemiBold',
  },
  text2: {
    color: '#000000',
    fontSize: 15,
    marginTop: 3,
    fontFamily: 'OpenSans-Bold',
  },
  text3: {
    color: '#000000',
    fontSize: 13,
    fontFamily: 'OpenSans-SemiBold',
  },
  text4: {
    color: '#000000',
    fontSize: 13,
    fontFamily: 'OpenSans-Bold',
  },
  text5: {
    color: '#000000',
    fontSize: 10,
    fontFamily: 'OpenSans-SemiBold',
  },
});
export default NewOrderDetail;
