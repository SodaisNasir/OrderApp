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
import {updateOrderStatus} from '../../Redux/Reducers/Actions';
import {useDispatch} from 'react-redux';

const OrderDetailsScreen: React.FC = ({navigation, route}) => {
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [time, setTime] = useState(30);
  const order = route.params.order;
  console.log('order.addons ==>', order.order_details[0]);

  const accountType = route.params.type;
  console.log('accountType', accountType);

  useFocusEffect(
    useCallback(() => {
      navigation
        .getParent()
        ?.setOptions({tabBarStyle: {display: 'none'}, swipeEnabled: false});
    },[]),
  );
  const itemsData = [
    {name: 'Product 1', price: 100.0},
    {name: 'Product 2', price: 150.0},
    {name: 'Product 3', price: 200.0},
  ];

  // ${JSON.parse(item.addons)
  //   .map(item => {
  //    return `<div class="item">
  // <div class="item-quantity">x${item.quantity}</div>
  // <div class="item-name">${item.as_name}</div>
  // <div class="item-price">$${item.as_price}</div>
  // </div>`;
  //   })
  //   .join(' ')}

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
      
      <div class="receipt">
        <div class="header">
          <h2>Receipt</h2>
          <p>Date: August 21, 2023</p>
        </div>
        
        <div class="restaurant-info">
          <img class="restaurant-logo" src="restaurant-logo.png" alt="Restaurant Logo">
          <p class="info-label">Restaurant:</p>
          <p>My Restaurant</p>
          <p>123 Main Street</p>
          <p>City, State, ZIP</p>
          <p>Contact: (123) 456-7890</p>
        </div>
        ${
          order.order_details.deal
            ? order.order_details.deal
                .map(item => {
                  return `<div class="item">
      <div class="item-quantity">x${item.qty}</div>
      <div class="item-name">${item.deal_details.deal_name}</div>
      <div class="item-price">€${item.deal_details.deal_price}</div>
    
      </div>`;
                })
                .join(' ')
            : ''
        }
    
        ${
          order.order_details.product
            ? order.order_details.product
                .map(item => {
                  return `<div class="item">
      <div class="item-quantity">x${item.qty}</div>
      <div class="item-name">${item.product_details.name}</div>
      <div class="item-price">€${item.price}</div>
    
      </div>`;
                })
                .join(' ')
            : ' '
        }
    
        ${`<div class="total">
          Total: ${order.order_total_price}
        </div>`}
        
        <div class="customer-info">
          <p class="info-label">Customer:</p>
          <p>John Doe</p>
          <p>456 Elm Street</p>
          <p>City, State, ZIP</p>
        </div>
        <div id="qrcode" style="display:flex; align-itmes:center; justify-content:center; height: 200px" margin-top:20px>
        <Img
        src="${QRCodeUrl}/${QRCODE}"
        /></div>
        
      </div>
      </body>
      </html>
      `,

      //       `<!DOCTYPE html>
      //     <html>
      //     <head>
      //         <title>QR Code Example</title>
      //         <!-- Include qrcode-generator library -->
      //         <script src="/Users/macbook/Documents/Projects/OrderApp/QR/qrcode.min.js"></script>
      //         <style type="text/css">
      //         @media print{
      //             .button{
      //                 display: none;
      //             }
      //         }
      //         @media print{
      //             @page{
      //                 margin-top: 0;
      //                 margin-bottom: 0;
      //             }
      //             body{
      //                 max-height: fit-content;
      //                 padding-top: 72px;
      //                 padding-bottom: 72px;
      //             }
      //         }
      //     </style>
      //     </head>
      //     <body>
      //     <div class="print" style="border:1px solid #a1a1a1; width: 82mm; background: white;padding: 10px; margin: 0 auto; text-align: center;">
      //     <h3 style="font-size: 15px;font-weight: 800;font-family: math;margin: 7px 0 0 0;">Kuhngasse 1, 76684 Östringen</h3>
      //         <h3 style="    font-size: 14px;font-weight: 800;font-family: math;margin: 3px 0 0 0;">Östringen, Tell:0725326560-61</h3>
      //     <h3 style="font-size: 14px;font-weight: 800;font-family: math;margin: 3px 0 0 0;">Phone: test</h3>
      //     <h3 style="font-size: 14px;font-weight: 800;font-family: math;margin: 3px 0 0 0;">Email:test </h3>
      //     <h3 style="font-size: 14px;font-weight: 800;font-family: math;margin: 3px 0 0 0;">Address:test</h3>
      //     <h3 style="font-size: 14px;font-weight: 800;font-family: math;margin: 3px 0 0 0;">Name: test</h3>
      //         <div id="qrcode" style="display:flex; align-itmes:center; justify-content:center "></div>
      //         <div class="footer">
      //         <p style="margin: 10px 0 10px 0; padding: 45px; font-weight: 700;font-family: sans-serif;">Danke für Ihren Einkauf*</p>
      //     </div>
      //     </div>
      //     <script>
      //     // Content you want to encode
      //     var contentToEncode = 'https://www.example.com'; // Replace with the actual URL or content

      //     // Create a QRCode instance
      //     var qrcode = new QRCode(document.getElementById("qrcode"), {
      //         text: contentToEncode,
      //         width: 128,
      //         height: 128,
      //     });

      //     // Generate the QR code
      //     qrcode.makeCode(contentToEncode);
      // </script>

      //     </body>
      //     </html>`

      fileName: `Resume_${Math.floor(Math.random() * 10000)}`,
      base64: true,
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
console.log('order.cstatus', order)
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
          {/* <View style={{alignSelf: 'center'}}>
            <Text
              style={{
                fontSize: scale(20),
                fontWeight: 'bold',
                color: Colors.textBlue,
              }}>
              {order.orderNumber}
            </Text>
          </View> */}
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
              )}}
            />
            {order.order_details.deals && (
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
                        // backgroundColor: 'red',
                      }}>
                      <Image
                        style={{height: '100%', width: '100%'}}
                        source={{
                          uri: `${imageUrl}${order.order_details.deals.deal_details.deal_image}`,
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
                    // console.log('item', item)
                    return(
                    <>
                      {/* <View
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
                       backgroundColor: 'red',
                     }}>
                     <Image
                       style={{height: '100%', width: '100%'}}
                       source={{
                         uri: `${imageUrl}${item.deal_details.deal_image}`,
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
                             height: scale(10),
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
                                 }}>{`$${item.as_price}`}</Text>
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
                     }}>{`Price :$${item.price}`}</Text>
                 </View>
               </View> */}
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
              {/* <CustomButton
          title="Confirm"
          onPress={onBackdropPress}
          ButtonStyle={{height: '15%', width: '40%', marginTop: scale(20)}}
        /> */}
            </View>
          )}
          {accountType == 'kitchen' && (
            <View
              style={{
                flexDirection: 'row',
                width: '100%',
                marginTop: scale(20),
                alignItems: 'center',
                // justifyContent: 'center',
                // paddingHorizontal: scale(30),

                height: '10%',
                borderBottomLeftRadius: scale(10),
                borderBottomRightRadius: scale(10),
              }}>
              {order.status == 'neworder' && (
                <View style={{flexDirection:'row',height:'100%',}}>

                  <TouchableOpacity
                    onPress={ !loading ?() => onConfirm('neworder') : () => null}
                    style={[
                      // styles.bottomButtons,
                      {
                        height: '100%',
                        alignItems: 'center',
                        justifyContent: 'center',
                        // width: '100%',
                        borderBottomLeftRadius: scale(10),
                        // borderBottomRightRadius: scale(10),
                        width: '50%',
                        // borderBottomLeftRadius: scale(10),
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
                        // width: '100%',
                        // borderBottomLeftRadius: scale(10),
                        borderBottomRightRadius: scale(10),
                        width: '50%',
                        // borderBottomLeftRadius: scale(10),
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
    // paddingHorizontal: moderateScale(15),
    paddingTop: moderateScale(20),
    // paddingVertical: moderateScale(20),
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
