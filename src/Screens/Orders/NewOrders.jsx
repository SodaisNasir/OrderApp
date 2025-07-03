import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect, useState} from 'react';
import {
  FlatList,
  PermissionsAndroid,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import ThermalPrinter from 'react-native-thermal-printer';
import {useDispatch, useSelector} from 'react-redux';
import CustomButton from '../../Components/CustomButton';
import {Colors} from '../../../important/Colors';
import {getOrders, getRiderDeliveries} from '../../Redux/Reducers/Actions';
import {ListComponent} from '../../Components/ListComponent';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const NewOrdersScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const [devices, setDevices] = useState([]);  
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedMac, setSelectedMac] = useState(null);

  const user = useSelector(state => state.auth?.userDetails);
  const orders = useSelector(state => state.auth?.newOrders);

  // console.log('orders', JSON.stringify(orders))

  const type = user?.role_id == '1' ? 'kitchen' : null;

  useFocusEffect(
    useCallback(() => {
      navigation.getParent()?.setOptions({
        tabBarStyle: {display: 'flex', backgroundColor: Colors.primary},
        swipeEnabled: true,
      });
        setIsRefreshing(true);
        if (user?.role_id == 2) {
          dispatch(getRiderDeliveries(user.id));
        } else {
          dispatch(getOrders('neworder'));
        }
        setIsRefreshing(false);
      }, []),
    );

    const handleRefresh = async () => {
  setIsRefreshing(true);
  
  if (user?.role_id == 2) {
    await dispatch(getRiderDeliveries(user.id));
  } else {
    await dispatch(getOrders('neworder'));
  }

  setIsRefreshing(false);
};

  //   const printRecpit = async QRCODE => {
  //     const results = await RNHTMLtoPDF.convert({
  //       // html: pdfData,
  //       html: `<!DOCTYPE html>
  // <html lang="de">

  // <head>
  //     <meta charset="UTF-8">
  //     <meta http-equiv="X-UA-Compatible" content="IE=edge">
  //     <meta name="viewport" content="width=device-width, initial-scale=1.0">
  //     <link rel="stylesheet" type="text/css" href="assets/css/bootstrap.min.css">
  //     <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
  //     <title>Quittung</title>
  //     <style type="text/css">
  //         @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap');

  //         @media print {
  //             .button {
  //                 display: none;
  //             }

  //             @page {
  //                 margin-top: 0;
  //                 margin-bottom: 0;
  //             }

  //             body {
  //                 max-height: fit-content;
  //                 max-width: fit-content;
  //                 padding-top: 10px;
  //                 padding-bottom: 10px;

  //             }
  //         }

  //         body {
  //             font-family: sans-serif;
  //             font-size: 18px;
  //         }

  //         .receipt-container {
  //             border: none;
  //             width: 56mm;
  //             text-align: center;
  //             box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);

  //         }

  //         .header-logo {
  //             display: flex;
  //             justify-content: center;
  //             align-items: center;
  //             margin-bottom: 8px;
  //             /* Increased bottom margin for header */
  //         }

  //         .logo {
  //             width: 45px;
  //             /* Slightly larger logo for modern feel */
  //             height: 45px;
  //             margin-right: 12px;
  //             /* More space next to logo */
  //         }

  //         .company-name {
  //             font-size: 18px;
  //             /* Slightly larger company name */
  //             margin: 0;
  //             text-align: left;
  //             margin-left: 0;
  //             font-weight: bold;
  //             /* Black company name */
  //         }

  //         .order-details-header,
  //         .item-details,
  //         .footer-totals,
  //         .footer-message,
  //         .order-info {
  //             text-align: left;
  //             margin-top: 5px;
  //             margin-bottom: 5px;
  //             font-weight: bold;

  //         }

  //         .company-details h3,
  //         .order-details-header h1,
  //         .item-details table th,
  //         .item-details table td,
  //         .footer-totals ul li,
  //         .footer-message p,
  //         .order-info h3 {
  //             font-size: 14px;
  //             margin: 3px 0;
  //             font-weight: bold;

  //         }

  //         /* Lighter company details text */
  //         .order-details-header h1 {
  //             font-size: 16px;
  //             font-weight: bold;
  //             text-align: center;
  //             margin-bottom: 10px;
  //         }

  //         /* Slightly larger, bolder header */
  //         .item-details table th {
  //             font-weight: bold;
  //             padding-bottom: 8px;
  //             font-size: 14px;
  //             text-transform: uppercase;
  //             letter-spacing: 0.5px;
  //         }

  //         /* Uppercase headers */
  //         .item-details table td {
  //             padding: 5px 0;
  //             border-bottom: 1px dashed #000;
  //         }

  //         /* Lighter, dashed item separator */
  //         .footer-totals ul {
  //             padding: 0;
  //             list-style: none;
  //             margin-top: 10px;
  //             padding-top: 10px;
  //         }

  //         /* Top border for totals */
  //         .footer-totals ul li {
  //             display: flex;
  //             justify-content: space-between;
  //             font-size: 13px;
  //             margin-bottom: 3px;
  //         }

  //         /* Slightly more margin for totals */
  //         .footer-totals ul li span {
  //             text-align: right;
  //             font-weight: bold;
  //         }

  //         /* Bold total amounts */
  //         .footer-message p {
  //             font-weight: bold;
  //             text-align: center;
  //             padding-top: 12px;
  //             font-size: 13px;
  //             color: #000;
  //         }

  //         /* More prominent thank you message */

  //         .order-info h3 {
  //             font-size: inherit;
  //             margin: 3px 0;
  //             font-weight: bold;
  //             font-size: 12px;
  //             color: Black;
  //             /* Lighter order info text */
  //         }

  //         .item-name {
  //             font-weight: bold;

  //         }

  //         .item-options {
  //             font-size: 12px;
  //         }

  //         .total-price {
  //             font-weight: bold;
  //             text-align: right;
  //         }

  //         .payment-method-info {
  //             margin-top: 12px;
  //             text-align: center;
  //             font-size: 12px;
  //             /* Lighter payment info text */
  //             border-top: 1px solid #000;
  //             /* Separator for payment info */
  //             padding-top: 10px;
  //         }

  //         .company-details h3,
  //         .order-info h3 {
  //             line-height: 1.4;
  //             /* Improved line height for details */
  //         }

  //         .order-info {
  //             text-align: center;
  //         }

  //         .item-notes {
  //             font-size: 0.7rem;
  //             color: black;
  //             /* Slightly lighter for a subdued look */
  //             margin-top: 4px;
  //             white-space: pre-wrap;
  //             /* Preserves line breaks */
  //         }
  //     </style>
  // </head>

  // <body>
  // <div class="receipt-container print">
  //         <div class="header-logo">
  //             <img src="https://xn--pizzablitzstringen-m3b.de/pizza_blitz/admin_panel/images/logo.png" style="width: 38%">
  //             <h3 class="company-name"> pizzablitzöstringen.de</h3>
  //         </div>

  //         <div class="company-details">
  //             <h3>pizzablitzöstringen.de Östringen</h3>
  //             <h3>Kuhngasse 1, 76684
  //                 Östringen</h3>
  //             <h3>Östringen,
  //                 Tell:0725326560-61</h3>
  //             <h3>Befehl no:</h3>
  //         </div>

  //         <div class="order-info">
  //             <h3>2025-06-05 10:54:00</h3>

  //             <h3>Phone: +4917682540212</h3>

  //             <h3>Email:
  //                 Jonas.bender.1@web.de</h3>

  //             <h3>Address: </h3>
  //             <h3>Name: </h3>

  //         </div>

  //         <div class="order-details-header">
  //             <h1>Befehl Einzelheiten*</h1>
  //         </div>

  //         <div class="item-details">
  //             <table style="width: 100%; border-collapse: collapse;">
  //                 <thead>
  //                     <tr>
  //                         <th style="text-align: left;">Qty</th>
  //                         <th style="text-align: left; width: 60%;">Menge</th>
  //                         <th style="text-align: right;">Preis</th>
  //                     </tr>
  //                 </thead>
  //                 <tbody>
  //                     <tr>
  //                         <td>x3</td>
  //                         <td>
  //                             <div class="item-name">Schnitzel Gorgonzola</div>

  //                             <div class="item-options"> </div>
  //                         </td>
  //                         <td class="total-price">
  //                             €47.70 </td>
  //                     </tr>
  //                 </tbody>
  //             </table>
  //         </div>

  //         <div class="footer-totals">
  //             <ul>
  //                 <li><span>Zwischensumme:</span><span>€47.70</span></li>
  //                 <li><span>Rabatt:</span><span>-€0.00</span></li>
  //                 <li><span>Lieferung:</span><span>€0.00</span></li>
  //                 <li><span>MwSt. (7%):</span><span>€3.12</span></li>
  //                 <li><span>MwSt. (19%):</span><span>€0.00</span></li>
  //                 <li><span>Gesamt:</span><span>€47.70</span></li>

  //             </ul>
  //         </div>

  //         <div class="payment-method-info">
  //             Zahlungsmethode: cash </div>

  //         <div class="footer-message">
  //             <p>Vielen Dank für Ihren Einkauf!</p>
  //         </div>
  //     </div>
  // </body>

  // </html>`,

  //       fileName: `Recipt_${Math.floor(Math.random() * 10000)}`,
  //       base64: true,
  //       // height:2000,
  //       // width:100,
  //     });

  //     await RNPrint.print({filePath: results.filePath});
  //     // setLoading(false);
  //   };


  useEffect(() => {
    if (Platform.OS === 'android') {
      PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      );
    }

    // const fetchDevices = async () => {
    //   try {
    //     const list = await ThermalPrinter.getBluetoothDeviceList();
    //     console.log('Devices:', list);
    //     setDevices(list);
    //     if (list.length > 0) setSelectedMac(list[0].macAddress);
    //   } catch (err) {
    //     console.log('Error getting devices', err);
    //   }
    // };

    // fetchDevices();
  }, []);

  // const orderData = {
  //   orderNo: 123456,
  //   date: '2025-06-05 10:54',
  //   phone: '+4917682540212',
  //   email: 'Jonas.bender.1@web.de',
  //   items: [
  //     {name: 'Schnitzel Gorgonzola', qty: 3, price: 47.7},
  //     {name: 'Pizza Margherita', qty: 2, price: 19.8},
  //     {name: 'Cola 0.5L', qty: 4, price: 7.6},
  //   ],
  //   paymentMethod: 'Cash',
  //   subtotal: 75.1,
  //   discount: 0.0,
  //   delivery: 0.0,
  //   tax7: 5.26,
  //   tax19: 0.0,
  //   total: 75.1,
  // };

  // const htmlTemplate = `
  //  <!DOCTYPE html>
  //     <html>
  //     <head>
  //       <style>
  //         body {
  //           font-family: sans-serif;
  //           font-size: 14px;
  //         }
  //         .receipt-container {
  //           width: 58mm;
  //           margin: 0 auto;
  //           padding: 10px;
  //           text-align: center;
  //         }
  //         table {
  //           width: 100%;
  //           border-collapse: collapse;
  //           margin-top: 10px;
  //         }
  //         td, th {
  //           padding: 5px;
  //           font-size: 12px;
  //           text-align: left;
  //         }
  //         .totals {
  //           margin-top: 10px;
  //           font-size: 12px;
  //         }
  //         .totals div {
  //           display: flex;
  //           justify-content: space-between;
  //         }
  //         .footer {
  //           margin-top: 15px;
  //           font-size: 12px;
  //           font-weight: bold;
  //         }
  //       </style>
  //     </head>
  //     <body>
  //       <div class="receipt-container">
  //         <h2>pizzablitz.de Östringen</h2>
  //         <p>Kuhngasse 1, 76684 Östringen<br/>Tel: 0725326560-61</p>
  //         <p><strong>Bestellung Nr:</strong> ${orderData.orderNo}</p>
  //         <p>${orderData.date}</p>
  //         <p><strong>Phone:</strong> ${orderData.phone}</p>
  //         <p><strong>Email:</strong> ${orderData.email}</p>

  //         <h3>Artikel</h3>
  //         <table style="width: 100%; border-collapse: collapse;">
  //                 <thead>
  //                     <tr>
  //                         <th style="text-align: left;">Qty</th>
  //                         <th style="text-align: left; width: 60%;">Menge</th>
  //                         <th style="text-align: right;">Preis</th>
  //                     </tr>
  //                 </thead>
  //                 <tbody>
  //                     <tr>
  //                         <td>x3</td>
  //                         <td>
  //                             <div class="item-name">Schnitzel Gorgonzola</div>

  //                             <div class="item-options"> </div>
  //                         </td>
  //                         <td class="total-price">
  //                             €47.70 </td>
  //                     </tr>
  //                 </tbody>
  //             </table>

  //         <div class="totals">
  //           <div><span>Zwischensumme:</span><span>€${orderData.subtotal.toFixed(2)}</span></div>
  //           <div><span>Rabatt:</span><span>-€${orderData.discount.toFixed(2)}</span></div>
  //           <div><span>Lieferung:</span><span>€${orderData.delivery.toFixed(2)}</span></div>
  //           <div><span>MwSt. (7%):</span><span>€${orderData.tax7.toFixed(2)}</span></div>
  //           <div><span>MwSt. (19%):</span><span>€${orderData.tax19.toFixed(2)}</span></div>
  //           <div><strong>Gesamt:</strong><strong>€${orderData.total.toFixed(2)}</strong></div>
  //         </div>

  //         <div class="footer">
  //           Zahlungsmethode: ${orderData.paymentMethod}<br/>
  //           Vielen Dank für Ihren Einkauf!
  //         </div>
  //       </div>
  //     </body>
  //     </html>
  // `;

  // const textPayload = htmlToText(htmlTemplate, {
  //   wordwrap: false,
  // });

  // console.log(textPayload)

//   const printReceipt = async () => {
//     const payload = `
//                 pizzablitz.de
//          Kuhngasse 1, 76684 Östringen
//               Tel: 0725326560-61

//             Bestellung Nr: ${orderData.orderNo}

//               Datum: ${orderData.date}
//             Telefon: ${orderData.phone}
//           Email: ${orderData.email}

// ------------------------------------------------
// Menge         Produkt                 Preis
// ------------------------------------------------
// ${orderData.items
//   .map(
//     item =>
//       `${item.qty.toString().padEnd(6)}     ${item.name
//         .slice(0, 14)
//         .padEnd(14)}              ${item.price.toFixed(2)}`,
//   )
//   .join('\n')}

// ------------------------------------------------
// Zwischensumme:                         ${orderData.subtotal.toFixed(2)}

// Rabatt:                                ${orderData.discount.toFixed(2)}

// Lieferung:                             ${orderData.delivery.toFixed(2)}

// MwSt. (7%):                            ${orderData.tax7.toFixed(2)}

// MwSt. (19%):                           ${orderData.tax19.toFixed(2)}
// -----------------------------------------------
// Gesamt:                                ${orderData.total.toFixed(2)}

// Zahlungsmethode:           ${orderData.paymentMethod}
// ================================================
//                   Vielen Dank!
// `;
//     try {
//       const result = await ThermalPrinter.printBluetooth({
//         payload,
//         macAddress: selectedMac,
//         printerWidthMM: 58,
//         printerNbrCharactersPerLine: 42,
//       });
//       console.log('Printed result:', result);
//     } catch (error) {
//       console.log('Print error:', error);
//     }
//   };

  return (
    <View style={styles.container}>
      {/* <CustomButton title="Click" onPress={printReceipt} /> */}
      <FlatList
        style={{flex: 1, marginTop: verticalScale(10)}}
        data={orders}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item}) => (
          <ListComponent
            item={item}
            onPress={() =>
              navigation.navigate('Order Details', {order: item, type})
            }
          />
        )}
         refreshControl={
              <RefreshControl
              refreshing={isRefreshing}
              onRefresh={()=> handleRefresh()}
              />
              }
        ListEmptyComponent={
          <View style={{ flex: 1, marginTop: '80%', alignItems: "center", justifyContent: 'center',}}>
                  <MaterialCommunityIcons
                    name="file-search-outline"
                    color={Colors.primary}
                    size={80}
                  />
                  <Text
                    style={{
                      alignSelf: "center",
                      marginTop: 15,
                      fontSize: 18,
                    }}
                  >
                    No Order found
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

export default NewOrdersScreen;
