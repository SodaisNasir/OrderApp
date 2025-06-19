import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {Colors} from '../../Constants/Colors';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import CustomButton from '../../Components/CustomButton';
import TimeModal from '../../Components/TimeModal';
import {useFocusEffect} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNPrint from 'react-native-print';
import {QRCodeUrl, imageUrl} from '../../Constants/Urls';
import {getPDFData, updateOrderStatus} from '../../Redux/Reducers/Actions';
import {useDispatch} from 'react-redux';

const OrderDetailsScreen = ({navigation, route}) => {
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [time, setTime] = useState(30);
  const order = route.params.order;
  // console.log('order.addons ==>', order.order_details[0]);

  const accountType = route.params.type;

  const [ pdfData,setpdfData] = useState(null)


  useFocusEffect(
    useCallback(() => {
      navigation
        .getParent()
        ?.setOptions({tabBarStyle: {display: 'none'}, swipeEnabled: false});
        getPDFData(setpdfData,order?.id)
    },[]),
  );
 

  const dispatch = useDispatch();
  const onConfirm = (elmnt) => {
    const status = order.status == 'neworder' && elmnt == 'canceled' ? 'canceled' : order.status == 'neworder' ? 'pending' : 'delivered';
    if(elmnt == 'neworder'){
      dispatch(updateOrderStatus(status, order.id, printRecpit, setLoading));
    }else{
      dispatch(updateOrderStatus(status, order.id, printRecpit, setLoading2));
    }
    // printRecpit();
  };
  const printRecpit = async (QRCODE) => {
    const results = await RNHTMLtoPDF.convert({
      // html: pdfData,
      html: `<!DOCTYPE html>
      <html>
      <head>
      <style>
        body {
          font-family: Arial, sans-serif;
        }
        .receipt {
          max-width: 300px;
          margin: 0 auto;
          padding: 20px;
          border: 1px solid #ccc;
          border-radius: 5px;
          background-color: #fff;
        }
        .header {
          text-align: center;
          margin-bottom: 10px;
        }
        .restaurant-info {
          margin-bottom: 10px;
          text-align: center;
        }
        .restaurant-logo {
          max-width: 100px;
          height: auto;
        }
        .customer-info {
          margin-top: 20px;
        }
        .info-label {
          font-weight: bold;
        }
        .item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
        }
        .item-name {
          flex: 1;
        }
        .item-quantity {
          flex: .1;
        }
        .item-price {
          flex-shrink: 0;
        }
        .total {
          text-align: right;
          margin-top: 10px;
          font-weight: bold;
        }
      </style>
      <script ></script>
      </head>
      <body>
      
      <div class="print"
      style="border:1px solid #a1a1a1; width: 82mm; background: white;padding: 10px; margin: 0 auto; text-align: center;">
      <div class="top_header" style="display: flex;">
          <!-- yahan image ka url dal dioo shahboo -->
          <img src="https://xn--pizzablitzstringen-m3b.de/pizza_blitz/admin_panel/images/logo.png" style="width: 38%">
          <h3 style="font-size: 17px;font-family: sans-serif;margin: 54px 0 0 -20px">pizzablitzöstringen.de</h3>
      </div>
      <div class="middle-header">
          <h3 style="font-size: 15px;font-weight: 800;font-family: math;margin: 7px 0 0 0;">Kuhngasse 1, 76684
              Östringen</h3>
          <h3 style="    font-size: 14px;font-weight: 800;font-family: math;margin: 3px 0 0 0;">Östringen,
              Tell:0725326560-61</h3>
          <h3 style="font-size: 14px;font-weight: 800;font-family: math;margin: 3px 0 0 0;">
              Befehl no: ${order?.id}</h3>
          <h3 style="font-size: 14px;font-weight: 800;font-family: math;margin: 3px 0 0 0;">${order?.created_at}</h3>
          <h3 style="font-size: 14px;font-weight: 800;font-family: math;margin: 3px 0 0 0;">Phone: +4917682540212</h3>
          <h3 style="font-size: 14px;font-weight: 800;font-family: math;margin: 3px 0 0 0;">Email:
              Jonas.bender.1@web.de</h3>
          <h3 style="font-size: 14px;font-weight: 800;font-family: math;margin: 3px 0 0 0;">Address:</h3>
          <h3 style="font-size: 14px;font-weight: 800;font-family: math;margin: 3px 0 0 0;">Name: ${order?.Shipping_address}</h3>
          <h3 style="font-size: 14px;font-weight: 800;font-family: math;margin: 3px 0 0 0;">${order?.Shipping_address_2} ${order?.Shipping_city}</h3>
          <h3 style="font-size: 14px;font-weight: 800;font-family: math;margin: 3px 0 0 0;">${order?.Shipping_postal_code} </h3>
          <h3 style="font-size: 14px;font-weight: 800;font-family: math;margin: 3px 0 0 0;">${order?.Shipping_area} </h3>
          <h3 style="font-size: 14px;font-weight: 800;font-family: math;margin: 3px 0 0 0;">${order?.addtional_notes}
          </h3>
          <div>
              <h1 style="font-size: 16px;font-weight: 700;font-family: sans-serif;    margin: 10px 0 0 0;">
                  Befehl Einzelheiten*</h1>
              <div class="Details">
                  <table style="width: 100%">
                      <thead>
                          <tr>
                              <th style="text-align: left; font-family: sans-serif;">Qty</th>
                              <th style="width: 80%;text-align: left; font-family: sans-serif;">Menge</th>
                              <th style="text-align: left; font-family: sans-serif;">Preis</th>
                          </tr>
                      </thead>
                      <tbody style="font-size: 12px;">
                          ${                           order.order_details.product.map((product) => {
                          const qty = product.qty;
                          const name = product.product_details.name;
                          const discountedPrice = product.price * (product.discount_percent / 100);
                          const dressing = JSON.parse(product.dressing);

                          return `<tr>
                              <td style="text-align: left;">${qty}</td>
                              <td style="text-align: left; width: 80%; font-weight: 500;font-family: sans-serif;">
                                  <b>${name}</b> - <br>


                                  ${dressing.map((item) => (
                                 ` <span>
                                      ${item.dressing_title}
                                      <br>
                                  </span>`
                                  ))}


                              </td>
                              <td style="text-align: left;"><b>€${discountedPrice}<b></td>
                          </tr>`
                          })}
                      </tbody>
                  </table>
              </div>
          </div>

          <div class="footer">
              <ul style="display: flex;list-style: none;padding: 0; font-weight: 700;font-family: sans-serif;">
                  <li style="width: 50%;text-align: left;">Zwischensumme:</li>
                  <li style="width: 50%;text-align: right;">€${Number(order?.order_total_price - order?.Shipping_Cost).toFixed(2)}</li>
              </ul>
          </div>
          <div class="footer">
              <ul style="display: flex;list-style: none;padding: 0; font-weight: 700;font-family: sans-serif;">
                  <li style="width: 50%;text-align: left;">Lieferladegeräte:</li>
                  <li style="width: 50%;text-align: right;">€${Number(order?.Shipping_Cost).toFixed(2)}</li>
              </ul>
          </div>
          <div class="footer">
              <ul style="display: flex;list-style: none;padding: 0; font-weight: 700;font-family: sans-serif;">
                  <li style="width: 50%;text-align: left;">Gesamt:</li>
                  <li style="width: 50%;text-align: right;">€${Number(order?.order_total_price).toFixed(2)}</li>
              </ul>
          </div>

          <div class="footer">
              <ul style="display: flex;list-style: none;padding: 0; font-weight: 700;font-family: sans-serif;">
                  <li style="width: 50%;text-align: left;">Bezahlverfahren:</li>
                  <li style="width: 50%;text-align: right;">${order?.payment_type}</li>
              </ul>
          </div>
          <div class="footer">
              <p style="margin: 10px 0 10px 0; padding: 45px; font-weight: 700;font-family: sans-serif;">Danke für
                  Ihren Einkauf*</p>
          </div>

          <div id="qrcode" style="display:flex; align-itmes:center; justify-content:center; height: 200px" margin-top:20px>
          <Img
          src="${QRCodeUrl}/${QRCODE}"
          /></div>
      </div>
  </div>
      </body>
      </html>`,

      fileName: `Recipt_${Math.floor(Math.random() * 10000)}`,
      base64: true,
      // height:2000,
      // width:100,
    });

    await RNPrint.print({filePath: results.filePath});
    setLoading(false);
  };

  const incrtement = () => {
    setTime(prev => prev + 10);
  };
  const decrement = () => {
    if (time > 0) {
      setTime(prev => prev - 10);
    }
  };

  return (
    <>
      <View
        style={{
          backgroundColor:
            order.status == 'neworder'
              ? Colors.textLighestGrey
              : order.status == 'pending'
              ? Colors.primaryOrg
              : Colors.lightprimary,
          paddingHorizontal: scale(15),
          paddingVertical: scale(20),
        }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <View
        style={[
          styles.container,
          {
            backgroundColor:
              order.status == 'neworder'
                ? Colors.textLighestGrey
                : order.status == 'pending'
                ? Colors.primaryOrg
                : Colors.lightprimary,
          },
        ]}>
        <View style={styles.card}>
          <View style={{flex: 1, paddingHorizontal: moderateScale(15)}}>
            <Text style={{fontSize: scale(15), fontWeight: '700'}}>
              Order Details
            </Text>
            <FlatList
              style={{height: '100%'}}
              data={order.order_details.product}
              renderItem={({item}) => {
                const vvv = order.order_total_price - item.price
                const discountAmount = (vvv * item.discount_percent) / 100;
                const newDiscountedPrice = item.price + discountAmount;
                console.log('item  ===v ', newDiscountedPrice )
                return(
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginVertical: scale(5),
                    borderRadius: scale(10),
                    padding: scale(10),
                    marginHorizontal: scale(5),
                    shadowOffset: {
                      height: scale(1),
                      width: scale(1),
                    },
                    backgroundColor: Colors.backgroundColor,
                    shadowColor: Colors.iconBackground,
                    shadowOpacity: 1,
                  }}>
                  <View style={{flexDirection: 'row'}}>
                    <View
                      style={{
                        height: scale(50),
                        width: scale(50),
                        // backgroundColor: 'red',
                      }}>
                      <Image
                        style={{height: '100%', width: '100%'}}
                        source={{
                          uri: `${imageUrl}${item.product_details.img}`,
                        }}
                      />
                    </View>
                    <View style={{marginLeft: scale(5), width: '60%'}}>
                      <Text
                        numberOfLines={2}
                        style={{
                          fontSize: scale(10),
                        }}>
                        {item.product_details.name}
                      </Text>

                      {item.addons && JSON.parse(item.addons).length > 0 && (
                        <>
                          <Text
                            style={{
                              fontSize: scale(9),
                              fontWeight: 'bold',
                            }}>
                            AddOns
                          </Text>
                          <ScrollView
                            style={{
                              marginLeft: scale(5),
                              width: scale(80),
                            }}>
                            {JSON.parse(item.addons).map(item => (
                              <View
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                }}>
                                <Text
                                  style={{
                                    color: Colors.iconBackground,

                                    fontSize: scale(8),
                                  }}>
                                  {item.as_name}
                                </Text>
                                <Text
                                  style={{
                                    color: Colors.iconBackground,
                                    fontSize: scale(8),
                                  }}>{`x${item.quantity}`}</Text>
                                <Text
                                  style={{
                                    color: Colors.iconBackground,
                                    fontSize: scale(8),
                                  }}>{`€${Number(item.as_price).toFixed(2)}`}</Text>
                              </View>
                            ))}
                          </ScrollView>
                        </>
                      )}
                    </View>
                  </View>
                  <View>
                    <Text
                      style={{
                        fontSize: scale(9),
                        color: Colors.iconBackground,
                      }}>{`Qty : ${item.qty}`}</Text>
                    <Text
                      style={{
                        fontSize: scale(9),
                        color: Colors.iconBackground,
                      }}>{`Price :€${Number(item.price).toFixed(2)}`}</Text>
                  </View>
                </View>
              )}}
            />
            {order?.order_details?.deals && (
              <>
                <Text style={{fontSize: scale(15), fontWeight: '700'}}>
                  Deals Details
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginVertical: scale(5),
                    borderRadius: scale(10),
                    padding: scale(10),
                    marginHorizontal: scale(5),
                    shadowOffset: {
                      height: scale(1),
                      width: scale(1),
                    },
                    backgroundColor: Colors.backgroundColor,
                    shadowColor: Colors.iconBackground,
                    shadowOpacity: 1,
                  }}>
                  <View style={{flexDirection: 'row'}}>
                    <View
                      style={{
                        height: scale(50),
                        width: scale(50),
                      }}>
                      <Image
                        style={{height: '100%', width: '100%'}}
                        source={{
                          uri: `${imageUrl}${order?.order_details?.deals?.deal_details?.deal_image}`,
                        }}
                      />
                    </View>
                    <View style={{marginLeft: scale(5), width: '60%'}}>
                      <Text
                        numberOfLines={2}
                        style={{
                          fontSize: scale(10),
                        }}>
                        {order.order_details.deals.deal_details.deal_name}
                      </Text>
                      <Text
                        numberOfLines={2}
                        style={{
                          fontSize: scale(10),
                        }}>
                        {
                          order.order_details.deals.deal_details
                            .deal_description
                        }
                      </Text>
                    </View>
                  </View>
                </View>

                <FlatList
                  data={order.order_details.deals.deal_product.details}
                  style={{height: '100%'}}
                  renderItem={({item}) => {
                    return(
                    <>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginVertical: scale(5),
                          borderRadius: scale(10),
                          padding: scale(10),
                          marginHorizontal: scale(5),
                          shadowOffset: {
                            height: scale(1),
                            width: scale(1),
                          },
                          backgroundColor: Colors.backgroundColor,
                          shadowColor: Colors.iconBackground,
                          shadowOpacity: 1,
                        }}>
                        <View style={{flexDirection: 'row'}}>
                          <View
                            style={{
                              height: scale(50),
                              width: scale(50),
                              // backgroundColor: 'red',
                            }}>
                            <Image
                              style={{height: '100%', width: '100%'}}
                              source={{
                                uri: `${imageUrl}${item.products_items.img}`,
                              }}
                            />
                          </View>
                          <View style={{marginLeft: scale(5), width: '60%'}}>
                            <Text
                              numberOfLines={2}
                              style={{
                                fontSize: scale(10),
                              }}>
                              {item.products_items.name}
                            </Text>

                            {item.addons &&
                              JSON.parse(item.addons).length > 0 && (
                                <>
                                  <Text
                                    style={{
                                      fontSize: scale(9),
                                      fontWeight: 'bold',
                                    }}>
                                    AddOns
                                  </Text>
                                  <ScrollView
                                    style={{
                                      marginLeft: scale(5),
                                      // height: scale(10),
                                      width: scale(80),
                                    }}>
                                    {JSON.parse(item.addons).map(item => (
                                      <View
                                        style={{
                                          flexDirection: 'row',
                                          alignItems: 'center',
                                          justifyContent: 'space-between',
                                        }}>
                                        <Text
                                          style={{
                                            color: Colors.iconBackground,

                                            fontSize: scale(8),
                                          }}>
                                          {item.as_name}
                                        </Text>
                                        <Text
                                          style={{
                                            color: Colors.iconBackground,
                                            fontSize: scale(8),
                                          }}>{`x${item.quantity}`}</Text>
                                        <Text
                                          style={{
                                            color: Colors.iconBackground,
                                            fontSize: scale(8),
                                          }}>{`€${Number(item.as_price).toFixed(2)}`}</Text>
                                      </View>
                                    ))}
                                  </ScrollView>
                                </>
                              )}
                          </View>
                        </View>
                        <View>
                          <Text
                            style={{
                              fontSize: scale(9),
                              color: Colors.iconBackground,
                            }}>{`Qty : ${item.qty}`}</Text>
                          <Text
                            style={{
                              fontSize: scale(9),
                              color: Colors.iconBackground,
                            }}>{`Price :€${Number(item.price).toFixed(2)}`}</Text>
                        </View>
                      </View>
                    </>
                  )}}
                />
              </>
            )}

            <View style={{alignSelf: 'flex-end', marginBottom: scale(30)}}>
              <Text>{`Total Amount :€${order.order_total_price}`} </Text>

              <Text style={{alignSelf: 'center'}}>
                Status :
                <Text
                  style={{
                    fontSize: scale(10),
                    color:
                      order.status == 'neworder'
                        ? Colors.textBlue
                        : order.status == 'delivered'
                        ? Colors.lightprimary
                        : Colors.primary,
                  }}>
                  {' '}
                  {order.status.toUpperCase()}
                </Text>
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Ionicons
                  name="location-outline"
                  size={scale(15)}
                  color="black"
                />
                <Text>{order.Shipping_postal_code}</Text>
              </View>
            </View>
          </View>
          {accountType == 'kitchen' && order.status != 'delivered' && (
            <View
              style={{
                flex: 0.3,
                backgroundColor: Colors.backgroundColor,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: scale(10),
              }}>
              <View style={{marginVertical: scale(20)}}>
                <Text>Time To Deliver / Prepare (Minutes)</Text>
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <TouchableOpacity onPress={decrement}>
                  <Text style={{fontSize: scale(30)}}>-</Text>
                </TouchableOpacity>
                <View
                  style={{
                    borderWidth: scale(1),
                    height: scale(50),
                    width: scale(50),
                    marginHorizontal: scale(10),
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Text>{time}</Text>
                </View>
                <TouchableOpacity onPress={incrtement}>
                  <Text style={{fontSize: scale(30)}}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {accountType == 'kitchen' && (
            <View
              style={{
                flexDirection: 'row',
                width: '100%',
                marginTop: scale(20),
                alignItems: 'center',
                height: '10%',
                borderBottomLeftRadius: scale(10),
                borderBottomRightRadius: scale(10),
              }}>
              {order.status == 'neworder' && (
                <View style={{flexDirection:'row',height:'100%',}}>

                  <TouchableOpacity
                    onPress={ !loading ?() => onConfirm('neworder') : () => null}
                    style={[
                      {
                        height: '100%',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderBottomLeftRadius: scale(10),
                        width: '50%',
                        backgroundColor: Colors.lightprimary,
                      },
                    ]}>
                   { !loading  ? (<Text>Confirm</Text>) : (<ActivityIndicator size={"large"} color={Colors.textLighestGrey}/>)}
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={ !loading2 ?() => onConfirm('canceled') : () => null}
                    style={[
                      // styles.bottomButtons,
                      {
                        height: '100%',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderBottomRightRadius: scale(10),
                        width: '50%',
                        backgroundColor: Colors.secondary,
                      },
                    ]}>
                   { !loading2  ? (<Text>Cancel</Text>) : (<ActivityIndicator size={"large"} color={Colors.textLighestGrey}/>)}
                  </TouchableOpacity>

                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </>
  );
};
const styles = StyleSheet.create({
  container: {
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(10),
    flex: 1,
  },
  titleText: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: moderateScale(20),
  },
  inputStyles: {marginVertical: scale(20)},
  card: {
    flex: 0.9,
    marginHorizontal: scale(20),
    backgroundColor: Colors.backgroundColor,
    paddingTop: moderateScale(20),
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
  bottomButtons: {
    height: '101%',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    borderBottomLeftRadius: scale(10),
    borderBottomRightRadius: scale(10),
  },
});
export default OrderDetailsScreen;
