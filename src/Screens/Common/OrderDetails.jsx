import React, {useCallback, useEffect, useState} from 'react';
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
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {Colors} from '../../../important/Colors';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import CustomButton from '../../Components/CustomButton';
import TimeModal from '../../Components/TimeModal';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNPrint from 'react-native-print';
import {QRCodeUrl, apiUrl, imageUrl} from '../../../important/Urls';
import {getPDFData, updateOrderStatus} from '../../Redux/Reducers/Actions';
import {useDispatch} from 'react-redux';
import ThermalPrinter from 'react-native-thermal-printer';
import { BluetoothStateManager } from "react-native-bluetooth-state-manager";
import { PoppinsFont } from '../../Constants/fonts';
import Toast from 'react-native-simple-toast';

const OrderDetailsScreen = ({navigation, route}) => {
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [time, setTime] = useState(30);
  const [devices, setDevices] = useState([]);
  const [selectedMac, setSelectedMac] = useState(null);
  const order = route.params.order;
  const accountType = route.params.type;
  const [pdfData, setpdfData] = useState(null);
  const navigationRoute = useNavigation()

  // console.log('order', JSON.stringify(order));

  useFocusEffect(
    useCallback(() => {
      navigation
        .getParent()
        ?.setOptions({tabBarStyle: {display: 'none'}, swipeEnabled: false});
      getPDFData(setpdfData, order?.id);
        if (Platform.OS === 'android') {
         PermissionsAndroid.requestMultiple([
           PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
             PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          ]);
            }
        const fetchDevices = async () => {
      try {
        const list = await ThermalPrinter.getBluetoothDeviceList();
        console.log('Devices:', list);
        setDevices(list);
        if (list.length > 0) setSelectedMac(list[0].macAddress);
      } catch (err) {
        console.log('Error getting devices', err);
      }
    };

    fetchDevices();
  }, []),
);

  const dispatch = useDispatch();
  const onConfirm = async(elmnt) => {
    const status =
      order.status == 'neworder' && elmnt == 'canceled'
        ? 'canceled'
        : order.status == 'neworder'
        ? 'pending'
        : 'delivered';
        try {
          const connectedPrinter = await BluetoothStateManager.getState();
      
          if (connectedPrinter == 'PoweredOff') {
            Toast.show('Bluetooth is currently disabled', Toast.SHORT);
            await BluetoothStateManager.requestToEnable();
            return;
          }

        //   const deviceList = await ThermalPrinter.getBluetoothDeviceList();
        // setDevices(deviceList); // optional: update state for UI

    if (!devices || devices.length === 0) {
      Toast.show('No paired Bluetooth printer found. Please pair one.', Toast.SHORT);
      await BluetoothStateManager.openSettings();
      return;
    }

    if (devices.length > 1) {
      Toast.show('Multiple Bluetooth devices found. Please unpair others to avoid conflict.', Toast.LONG);
      await BluetoothStateManager.openSettings();
      return;
    }

    const selectedPrinter = devices[0];

    // Optional: You may validate the printer name prefix
    if (!selectedPrinter.deviceName?.toLowerCase().includes('mtp') && !selectedPrinter.deviceName?.toLowerCase().includes('printer')) {
      Toast.show('Paired device is not recognized as a printer.', Toast.SHORT);
      return;
    }

    // Set selected MAC address and proceed with print
    setSelectedMac(selectedPrinter.macAddress);

  } catch (error) {
    console.log('Bluetooth error:', error);
    Toast.show('Bluetooth error. Make sure a printer is paired and connected.', Toast.LONG);
    return;
  }
    if (elmnt === 'neworder') {
      dispatch(updateOrderStatus(status, order.id, printReceipt, setLoading));
    } else {
      dispatch(updateOrderStatus(status, order.id, printReceipt, setLoading2));
    }
    // navigationRoute.goBack();
  };
  // const printRecpit = async QRCODE => {
  //   const results = await RNHTMLtoPDF.convert({
  //     // html: pdfData,
  //     html: `<!DOCTYPE html>
  //     <html>
  //     <head>
  //     <style>
  //       body {
  //         font-family: Arial, sans-serif;
  //       }
  //       .receipt {
  //         max-width: 300px;
  //         margin: 0 auto;
  //         padding: 20px;
  //         border: 1px solid #ccc;
  //         border-radius: 5px;
  //         background-color: #fff;
  //       }
  //       .header {
  //         text-align: center;
  //         margin-bottom: 10px;
  //       }
  //       .restaurant-info {
  //         margin-bottom: 10px;
  //         text-align: center;
  //       }
  //       .restaurant-logo {
  //         max-width: 100px;
  //         height: auto;
  //       }
  //       .customer-info {
  //         margin-top: 20px;
  //       }
  //       .info-label {
  //         font-weight: bold;
  //       }
  //       .item {
  //         display: flex;
  //         justify-content: space-between;
  //         margin-bottom: 5px;
  //       }
  //       .item-name {
  //         flex: 1;
  //       }
  //       .item-quantity {
  //         flex: .1;
  //       }
  //       .item-price {
  //         flex-shrink: 0;
  //       }
  //       .total {
  //         text-align: right;
  //         margin-top: 10px;
  //         font-weight: bold;
  //       }
  //     </style>
  //     <script ></script>
  //     </head>
  //     <body>

  //     <div class="print"
  //     style="border:1px solid #a1a1a1; width: 82mm; background: white;padding: 10px; margin: 0 auto; text-align: center;">
  //     <div class="top_header" style="display: flex;">
  //         <!-- yahan image ka url dal dioo shahboo -->
  //         <img src="https://xn--pizzablitzstringen-m3b.de/pizza_blitz/admin_panel/images/logo.png" style="width: 38%">
  //         <h3 style="font-size: 17px;font-family: sans-serif;margin: 54px 0 0 -20px">pizzablitzöstringen.de</h3>
  //     </div>
  //     <div class="middle-header">
  //         <h3 style="font-size: 15px;font-weight: 800;font-family: math;margin: 7px 0 0 0;">Kuhngasse 1, 76684
  //             Östringen</h3>
  //         <h3 style="    font-size: 14px;font-weight: 800;font-family: math;margin: 3px 0 0 0;">Östringen,
  //             Tell:0725326560-61</h3>
  //         <h3 style="font-size: 14px;font-weight: 800;font-family: math;margin: 3px 0 0 0;">
  //             Befehl no: ${order?.id}</h3>
  //         <h3 style="font-size: 14px;font-weight: 800;font-family: math;margin: 3px 0 0 0;">${
  //           order?.created_at
  //         }</h3>
  //         <h3 style="font-size: 14px;font-weight: 800;font-family: math;margin: 3px 0 0 0;">Phone: +4917682540212</h3>
  //         <h3 style="font-size: 14px;font-weight: 800;font-family: math;margin: 3px 0 0 0;">Email:
  //             Jonas.bender.1@web.de</h3>
  //         <h3 style="font-size: 14px;font-weight: 800;font-family: math;margin: 3px 0 0 0;">Address:</h3>
  //         <h3 style="font-size: 14px;font-weight: 800;font-family: math;margin: 3px 0 0 0;">Name: ${
  //           order?.Shipping_address
  //         }</h3>
  //         <h3 style="font-size: 14px;font-weight: 800;font-family: math;margin: 3px 0 0 0;">${
  //           order?.Shipping_address_2
  //         } ${order?.Shipping_city}</h3>
  //         <h3 style="font-size: 14px;font-weight: 800;font-family: math;margin: 3px 0 0 0;">${
  //           order?.Shipping_postal_code
  //         } </h3>
  //         <h3 style="font-size: 14px;font-weight: 800;font-family: math;margin: 3px 0 0 0;">${
  //           order?.Shipping_area
  //         } </h3>
  //         <h3 style="font-size: 14px;font-weight: 800;font-family: math;margin: 3px 0 0 0;">${
  //           order?.addtional_notes
  //         }
  //         </h3>
  //         <div>
  //             <h1 style="font-size: 16px;font-weight: 700;font-family: sans-serif;    margin: 10px 0 0 0;">
  //                 Befehl Einzelheiten*</h1>
  //             <div class="Details">
  //                 <table style="width: 100%">
  //                     <thead>
  //                         <tr>
  //                             <th style="text-align: left; font-family: sans-serif;">Qty</th>
  //                             <th style="width: 80%;text-align: left; font-family: sans-serif;">Menge</th>
  //                             <th style="text-align: left; font-family: sans-serif;">Preis</th>
  //                         </tr>
  //                     </thead>
  //                     <tbody style="font-size: 12px;">
  //                         ${order.order_details?.product.map(product => {
  //                           const qty = product.qty;
  //                           const name = product.product_details.name;
  //                           const discountedPrice =
  //                             product.price * (product.discount_percent / 100);
  //                           const dressing = JSON.parse(product.dressing);

  //                           return `<tr>
  //                             <td style="text-align: left;">${qty}</td>
  //                             <td style="text-align: left; width: 80%; font-weight: 500;font-family: sans-serif;">
  //                                 <b>${name}</b> - <br>

  //                                 ${dressing.map(
  //                                   item =>
  //                                     ` <span>
  //                                     ${item.dressing_title}
  //                                     <br>
  //                                 </span>`,
  //                                 )}

  //                             </td>
  //                             <td style="text-align: left;"><b>€${discountedPrice}<b></td>
  //                         </tr>`;
  //                         })}
  //                     </tbody>
  //                 </table>
  //             </div>
  //         </div>

  //         <div class="footer">
  //             <ul style="display: flex;list-style: none;padding: 0; font-weight: 700;font-family: sans-serif;">
  //                 <li style="width: 50%;text-align: left;">Zwischensumme:</li>
  //                 <li style="width: 50%;text-align: right;">€${Number(
  //                   order?.order_total_price - order?.Shipping_Cost,
  //                 ).toFixed(2)}</li>
  //             </ul>
  //         </div>
  //         <div class="footer">
  //             <ul style="display: flex;list-style: none;padding: 0; font-weight: 700;font-family: sans-serif;">
  //                 <li style="width: 50%;text-align: left;">Lieferladegeräte:</li>
  //                 <li style="width: 50%;text-align: right;">€${Number(
  //                   order?.Shipping_Cost,
  //                 ).toFixed(2)}</li>
  //             </ul>
  //         </div>
  //         <div class="footer">
  //             <ul style="display: flex;list-style: none;padding: 0; font-weight: 700;font-family: sans-serif;">
  //                 <li style="width: 50%;text-align: left;">Gesamt:</li>
  //                 <li style="width: 50%;text-align: right;">€${Number(
  //                   order?.order_total_price,
  //                 ).toFixed(2)}</li>
  //             </ul>
  //         </div>

  //         <div class="footer">
  //             <ul style="display: flex;list-style: none;padding: 0; font-weight: 700;font-family: sans-serif;">
  //                 <li style="width: 50%;text-align: left;">Bezahlverfahren:</li>
  //                 <li style="width: 50%;text-align: right;">${
  //                   order?.payment_type
  //                 }</li>
  //             </ul>
  //         </div>
  //         <div class="footer">
  //             <p style="margin: 10px 0 10px 0; padding: 45px; font-weight: 700;font-family: sans-serif;">Danke für
  //                 Ihren Einkauf*</p>
  //         </div>

  //         <div id="qrcode" style="display:flex; align-itmes:center; justify-content:center; height: 200px" margin-top:20px>
  //         <Img
  //         src="${QRCodeUrl}/${QRCODE}"
  //         /></div>
  //     </div>
  // </div>
  //     </body>
  //     </html>`,

  //     fileName: `Recipt_${Math.floor(Math.random() * 10000)}`,
  //     base64: true,
  //     // height:2000,
  //     // width:100,
  //   });

  //   await RNPrint.print({filePath: results.filePath});
  //   setLoading(false);
  // };

  const incrtement = () => {
    setTime(prev => prev + 10);
  };
  const decrement = () => {
    if (time > 0) {
      setTime(prev => prev - 10);
    }
  };

//   const allExtraPrice = order.order_details?.product?.reduce((total, elem) => {
//   const addons = JSON.parse(elem.addons || '[]');
//   const types = JSON.parse(elem.types || '[]');
//   const dressing = JSON.parse(elem.dressing || '[]');

//   const addonTotal = addons.reduce((sum, a) => sum + parseFloat(a.as_price || 0), 0);
//   const typeTotal = types.reduce((sum, t) => sum + parseFloat(t.price || 0), 0);
//   const dressingTotal = dressing.reduce((sum, d) => sum + parseFloat(d.price || 0), 0);

//   return total + addonTotal + typeTotal + dressingTotal;
// }, 0);


  // console.log('allExtraPrice', allExtraPrice)

 const printReceipt = async () => {
  const items = order.order_details?.product?.map(product => ({
    qty: product.qty,
    name: product.product_details?.name || 'Unnamed',
    price: (() => {
  const basePrice = parseFloat(product.price);
  const addons = JSON.parse(product.addons || '[]');
  const types = JSON.parse(product.types || '[]');
  const dressing = JSON.parse(product.dressing || '[]');

  const addonTotal = addons.reduce((sum, a) => sum + parseFloat(a.as_price || 0), 0);
  const typeTotal = types.reduce((sum, t) => sum + parseFloat(t.price || 0), 0);
  const dressingTotal = dressing.reduce((sum, d) => sum + parseFloat(d.price || 0), 0);

  return basePrice + addonTotal + typeTotal + dressingTotal;
})(),

  }));

  const sub_total = items.reduce((acc, item) => acc + item.price * parseInt(item.qty), 0);
  const dealTotal = order?.order_details?.deals?.reduce((sum, deal) => {
  return sum + parseFloat(deal.deal_details?.deal_price || 0);
}, 0);

const combinedSubtotal = sub_total + dealTotal;

  const addonData = order.order_details?.product?.map((elem, index) => {
    const basePrice = parseFloat(elem.price);
    const qty = parseInt(elem.qty);

    const addons = JSON.parse(elem.addons || '[]');
    const types = JSON.parse(elem.types || '[]');
    const dressing = JSON.parse(elem.dressing || '[]');


    return {
      addons: addons.map(a => ({
        title: a.ao_title,
        name: a.as_name,
        price: parseFloat(a.as_price),
        quantity: a.quantity
      })),
      types: types.map(t => ({
        name: t.ts_name,
        price: parseFloat(t.price),
      })),
      dressing: dressing.map(d => ({
        name: d.dressing_name,
        price: parseFloat(d.price || 0),
      })),
    };
  });

  const orderData = {
    orderNo: order?.id,
    date: order?.created_at,
    phone: order?.userDetails?.phone,
    email: order?.userDetails?.email,
    name: order?.userDetails?.name,
    shipping: order?.Shipping_address_2,
    city: order?.Shipping_city,
    postal: order?.Shipping_postal_code,
    shipping_address: order?.Shipping_address,
    shipping_area: order?.Shipping_area,
    add_notes: order?.addtional_notes,
    items,
    paymentMethod: order?.payment_type,
    subtotal: Number(combinedSubtotal).toFixed(2),
    discount: Number(order?.total_discount).toFixed(2),
    delivery: Number(order?.Shipping_Cost).toFixed(2),
    tax7: Number(order?.total_netto_tax).toFixed(2),
    tax19: Number(order?.total_metto_tax).toFixed(2),
    total: Number(order?.order_total_price).toFixed(2),
    qrCode: order?.qr_code
  };

  let receiptText = '';
  receiptText += ` [C]<img>https://placehold.co/600x400/png</img>\n`;
  receiptText += `[C]<b><font size='tall'>Pizzablitzöstringen.de</font></b>\n`;
  receiptText += '[L]\n';
  receiptText += `[C]<b>Kuhngasse 1, 76684 Östringen</b>\n`;
  receiptText += '[L]\n';
  receiptText += `[C]<b>Tel: 0725326560-61</b>\n`;
  receiptText += '[L]\n';
  receiptText += `[C]<b>Bestellung Nr: ${orderData.orderNo}</b>\n`;
  receiptText += '[L]\n';
  receiptText += `[C]<b>Datum: ${orderData.date}</b>\n`;
  receiptText += '[L]\n';
  receiptText += `[C]<b>Telefon: ${orderData.phone}</b>\n`;
  receiptText += '[L]\n';
  receiptText += `[C]<b>Email: ${orderData.email}</b>\n`;
  receiptText += '[L]\n';
  receiptText += `[C]<b>Adress: ${orderData.shipping_address}</b>\n`;
  receiptText += '[L]\n';
  receiptText += `[C]<b>Name: ${orderData.name}\n`;
  receiptText += '[L]\n';
  receiptText += `[C]<b>${orderData.shipping}-${orderData.city}</b>\n`;
  receiptText += '[L]\n';
  receiptText += `[C]<b>${orderData.postal}</b>\n`;
  receiptText += '[L]\n';
  receiptText += `[C]<b>${orderData.shipping_area}</b>\n`;
  receiptText += '[L]\n';
  receiptText += `[C]<b>${orderData.add_notes || ''}</b>\n`;
  receiptText += '[L]\n';
  receiptText += `[C]<b>Befehl Einzelheiten*</b>\n \n`;
  receiptText += '[L]\n';
  receiptText += '------------------------------------------------\n';
  receiptText += `<b><font size='tall'>Menge    Produkt                          Preis</font></b> \n`;
  receiptText += '------------------------------------------------\n';
  
  orderData.items.forEach((item, idx) => {
  receiptText += `[L]<b>x${item.qty}     ${item.name} [R]${item.price.toFixed(2)}</b>\n`;
  receiptText += '[L]\n';

  addonData[idx]?.addons?.forEach(addon => {
    receiptText += `[L]        <b>x${addon.quantity} ${addon.name}</b>\n`;
    receiptText += '[L]\n';
  });

  addonData[idx]?.types?.forEach(type => {
    if (type.name)
      receiptText += `[L]        <b>${type.name}</b>\n`;
    receiptText += '[L]\n';
  });

  addonData[idx]?.dressing?.forEach(d => {
    if (d.name)
      receiptText += `[L]        <b>${d.name}</b>\n`;
    receiptText += '[L]\n';
  });

  receiptText += '------------------------------------------------\n';
});

if (order?.order_details?.deals?.length) {

  order?.order_details?.deals.forEach((deal, dealIndex) => {
    const dealInfo = deal.deal_details;
    const dealProducts = deal.deal_product;

    receiptText += `[L]<b>${dealInfo.deal_name} [R]${parseFloat(dealInfo.deal_price).toFixed(2)}</b>\n`;
    receiptText += '[L]\n';

    dealProducts.forEach((product, productIndex) => {
      receiptText += `[L]<b>${product.product_name}</b>\n`;
      receiptText += '[L]\n';

      // Addons
      if (product.addons?.length) {
        product.addons.forEach(addon => {
          // const price = addon.as_price === "0" || addon.isFreeInDeal === "1" ? "Free" : `${parseFloat(addon.as_price).toFixed(2)}`;
          receiptText += `[L]        <b>x${addon.quantity} ${addon.as_name}</b>\n`;
          receiptText += '[L]\n';
        });
      }

      // Types
      const types = JSON.parse(product.types || '[]');
      if (types.length) {
        types.forEach(t => {
          receiptText += `[L]        <b>${t.ts_name}\n</b>`;
          receiptText += '[L]\n';
        });
      }

      // Dressing
      const dressing = JSON.parse(product.dressing || '[]');
      if (dressing.length) {
        dressing.forEach(d => {
          receiptText += `[L]        <b>${d.dressing_name}</b>\n`;
          receiptText += '[L]\n';
        });
      }

      receiptText += '[L]\n';
    });

    receiptText += '------------------------------------------------\n';
  });
}
  receiptText += '[L]\n';
  receiptText += `[L]<b>Zwischensumme:</b> [R]<b>${orderData.subtotal}</b>\n\n`;
  receiptText += '[L]\n';
  receiptText += `[L]<b>Rabatt:</b> [R]<b>${orderData.discount}</b>\n\n`;
  receiptText += '[L]\n';
  receiptText += `[L]<b>Lieferung:</b> [R]<b>${orderData.delivery}</b>\n\n`;
  receiptText += '[L]\n';
  receiptText += `[L]<b>MwSt. (7%):</b> [R]<b>${orderData.tax7}</b>\n\n`;
  receiptText += '[L]\n';
  receiptText += `[L]<b>MwSt. (19%):</b> [R]<b>${orderData.tax19}</b>\n\n`;
  receiptText += '[L]\n';
  receiptText += '------------------------------------------------\n';
  receiptText += '[L]\n';
  receiptText += `[L]<b>Gesamt:</b> [R]<b>${orderData.total}</b>\n\n`;
  
  receiptText += `[L]<b>Zahlungsmethode:</b> [R]<b>${orderData.paymentMethod}</b>\n\n`;
  receiptText += '[L]\n';
  receiptText += '================================================\n\n';
  receiptText += `[C]<b><font size='tall'>Vielen Dank!</font></b>\n`;
  receiptText += `[C]<qrcode size='20'>${QRCodeUrl}${orderData?.qrCode}</qrcode>`;
  
  try {
    const result = await ThermalPrinter.printBluetooth({
      payload: receiptText,
      macAddress: selectedMac,
      printerWidthMM: 80,
      printerNbrCharactersPerLine: 48,
      autoCut: true,
    });
    console.log('Printed!', result);
    setLoading(false)
    setLoading2(false)
  } catch (err) {
    setLoading(false);
    setLoading2(false)
    console.log('Failed to print:', err);
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
          <ScrollView style={{flex: 1, paddingHorizontal: moderateScale(15)}}>
            {order?.order_details?.product?.length ? (
              <>
                <Text style={{fontSize: scale(15), fontWeight: '700'}}>
                  Order Details
                </Text>
                <FlatList
                  style={{height: '100%'}}
                  showsVerticalScrollIndicator={true}
                  data={order.order_details?.product}
                  contentContainerStyle={{paddingHorizontal: 1}}
                  renderItem={({item}) => {
                    const vvv = order.order_total_price - item.price;
                    const discountAmount = (vvv * item.discount_percent) / 100;
                    const newDiscountedPrice = item.price + discountAmount;

                      // Parse extras
                        const addons = JSON.parse(item.addons || '[]');
                        const types = JSON.parse(item.types || '[]');
                        const dressings = JSON.parse(item.dressing || '[]');
                        // Calculate totals
                        const addonTotal = addons.reduce((sum, a) => sum + parseFloat(a.as_price || 0), 0);
                        const typeTotal = types.reduce((sum, t) => sum + parseFloat(t.price || 0), 0);
                        const dressingTotal = dressings.reduce((sum, d) => sum + parseFloat(d.price || 0), 0);
                        // Final total including extras
                        const basePrice = parseFloat(item.price || 0);
                        const totalPrice = basePrice + addonTotal + typeTotal + dressingTotal;


                    // console.log('item  ===v ', newDiscountedPrice);
                    return (
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginVertical: scale(5),
                          borderRadius: scale(10),
                          padding: scale(10),
                          // marginHorizontal: scale(5),
                          shadowOffset: {
                            height: scale(1),
                            width: scale(1),
                          },
                          backgroundColor: Colors.backgroundColor,
                          shadowColor: Colors.iconBackground,
                          shadowOpacity: 1,
                          elevation: 2,
                        }}>
                        <View style={{flexDirection: 'row'}}>
                          <View
                            style={{
                              height: scale(50),
                              width: scale(50),
                              borderRadius: 10,
                              overflow: 'hidden',
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
                                          }}>{`€${Number(item.as_price).toFixed(
                                          2,
                                        )}`}</Text>
                                      </View>
                                    ))}
                                  </ScrollView>
                                </>
                              )}
                          </View>
                        </View>
                        <View style={{marginLeft: -8}}>
                          <Text
                            style={{
                              fontSize: scale(9),
                              color: Colors.iconBackground,
                            }}>{`Qty : ${item.qty}`}</Text>
                          <Text
                            style={{
                              fontSize: scale(9),
                              color: Colors.iconBackground,
                            }}>{`Price :€${Number(totalPrice).toFixed(
                            2,
                          )}`}</Text>
                        </View>
                      </View>
                    );
                  }}
                />
              </>
            ) : null}

            {order?.order_details?.deals?.length ? (
              <>
                <Text style={{fontSize: scale(15), fontWeight: '700'}}>
                  Deals Details
                </Text>
                <View
                  style={{
                    // flexDirection: 'row',
                    // alignItems: 'center',
                    // justifyContent: 'space-between',
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
                    elevation: 2,
                  }}>
                  <View style={{flexDirection: 'row'}}>
                    <View
                      style={{
                        height: scale(50),
                        width: scale(50),
                        borderRadius: 10,
                        overflow: 'hidden',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <Image
                        style={{height: '100%', width: '100%'}}
                        source={{
                          uri: `${imageUrl}${order?.order_details?.deals[0]?.deal_details?.deal_image}`,
                        }}
                      />
                    </View>
                    <View style={{marginLeft: scale(5), width: '60%'}}>
                      <Text
                        numberOfLines={2}
                        style={{
                          fontSize: scale(10),
                        }}>
                        {order.order_details?.deals[0]?.deal_details?.deal_name}
                      </Text>
                      <Text
                        numberOfLines={2}
                        style={{
                          fontSize: scale(10),
                        }}>
                        {
                          order.order_details?.deals[0]?.deal_details
                            ?.deal_description
                        }
                      </Text>
                    </View>
                    <View style={{marginLeft: -8}}>
                          {/* <Text
                            style={{
                              fontSize: scale(9),
                              color: Colors.iconBackground,
                            }}>{`Qty : ${order.order_details?.deals[0]?.deal_details?.deal_price}`}</Text> */}
                          <Text
                            style={{
                              fontSize: scale(9),
                              color: Colors.iconBackground,
                            }}>{`Price :€${order.order_details?.deals[0]?.deal_details?.deal_price}`}</Text>
                        </View>
                  </View>                

                <FlatList
                  data={order.order_details?.deals[0]?.deal_product}
                  // style={{height: '100%'}}
                  renderItem={({item}) => {
                    return (
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
                                height: scale(30),
                                width: scale(30),
                                borderRadius: 10,
                                overflow: 'hidden',
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

                              {item.addons &&
                                item.addons.length > 0 && (
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
                                      {item.addons.map(item => (
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
                                            }}>{`€${Number(
                                            item.as_price,
                                          ).toFixed(2)}`}</Text>
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
                              }}>{`Qty : ${item.qty || 1}`}</Text>
                            {/* <Text
                              style={{
                                fontSize: scale(9),
                                color: Colors.iconBackground,
                              }}>{`Price :€${Number(item.price).toFixed(
                              2,
                            )}`}</Text> */}
                          </View>
                        </View>
                      </>
                    );
                  }}
                />
                </View>
              </>
            ) : null}

            <View style={{marginBottom: scale(30)}}>
              {/* <View style={styles.data_info}>
                <Text>Discount :</Text>
              <Text style={{color: Colors.black, fontFamily: PoppinsFont.Poppins600}}>
                €{order?.total_discount.toFixed(2)}
              </Text>
              </View>
              <View style={styles.data_info}>
                <Text>MwSt(7%) :</Text>
              <Text style={{color: Colors.black, fontFamily: PoppinsFont.Poppins600}}>
                €{order?.total_netto_tax.toFixed(2)}
              </Text>
              </View>
              <View style={styles.data_info}>
                <Text>Total Amount :</Text>
              <Text style={{color: Colors.black, fontFamily: PoppinsFont.Poppins600}}>
                €{order.order_total_price}
              </Text>
              </View>
              <View style={styles.data_info}>
                <Text> Status :</Text>
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
              </View> */}
              <Text style={{alignSelf: 'center'}}>
                {`MwSt(7%) :€${order?.total_netto_tax.toFixed(2)}`}
              </Text>
              <Text style={{alignSelf: 'center'}}>
                {`Total Amount :€${order.order_total_price}`}{' '}
              </Text>

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
          </ScrollView>
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
                <Text style={{color: Colors.grey}}>Time To Deliver / Prepare (Minutes)</Text>
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
                <TouchableOpacity style={{
                  borderWidth: scale(1),
                    height: scale(40),
                    width: scale(40),
                    borderRadius: 10,
                    borderColor: '#D1D5DB',
                    alignItems: 'center',
                    justifyContent: 'center',
                }} onPress={decrement}>
                  <Text style={{fontSize: scale(25)}}>-</Text>
                </TouchableOpacity>
                <View
                  style={{
                    borderWidth: scale(1),
                    height: scale(40),
                    width: scale(60),
                    borderRadius: 10,
                    borderColor: '#D1D5DB',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Text>{time}</Text>
                </View>
                <TouchableOpacity style={{
                  borderWidth: scale(1),
                    height: scale(40),
                    width: scale(40),
                    borderRadius: 10,
                    borderColor: '#D1D5DB',
                    alignItems: 'center',
                    justifyContent: 'center',
                }} onPress={incrtement}>
                  <Text style={{fontSize: scale(20)}}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {accountType == 'kitchen' && order.status == 'neworder' ? (
            <View
              style={{
                // flexDirection: 'row',
                width: '100%',
                marginTop: scale(20),
                marginBottom: 10,
                alignItems: 'center',
                height: '10%',
                borderBottomLeftRadius: scale(10),
                borderBottomRightRadius: scale(10),
              }}>
              <View style={{flexDirection: 'row', height: '100%', gap: 10}}>
                <TouchableOpacity
                  onPress={!loading ? () => onConfirm('neworder') : () => null}
                  style={[
                    {
                      height: '100%',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 10,
                      // borderBottomLeftRadius: scale(10),
                      width: '45%',
                      backgroundColor: '#22C55E',
                    },
                  ]}>
                  {!loading ? (
                    <Text style={{color: Colors.textColor}}>Confirm</Text>
                  ) : (
                    <ActivityIndicator
                      size={'large'}
                      color={Colors.textLighestGrey}
                    />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={!loading2 ? () => onConfirm('canceled') : () => null}
                  style={[
                    // styles.bottomButtons,
                    {
                      height: '100%',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 10,
                      // borderBottomRightRadius: scale(10),
                      width: '45%',
                      backgroundColor: '#EF4444',
                    },
                  ]}>
                  {!loading2 ? (
                    <Text style={{color: Colors.textColor}}>Cancel</Text>
                  ) : (
                    <ActivityIndicator
                      size={'large'}
                      color={Colors.textLighestGrey}
                    />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </View>
      </View>
    </>
  );
};
const styles = StyleSheet.create({
  container: {
    paddingVertical: verticalScale(0),
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
  data_info:{
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
});
export default OrderDetailsScreen;
