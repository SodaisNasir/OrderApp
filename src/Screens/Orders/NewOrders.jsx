import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  PermissionsAndroid,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useDispatch, useSelector } from 'react-redux';
import CustomButton from '../../Components/CustomButton';
import { Colors } from '../../../important/Colors';
import {
  getOrders,
  getRiderDeliveries,
  updateOrderStatus,
} from '../../Redux/Reducers/Actions';
import { ListComponent } from '../../Components/ListComponent';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-simple-toast';
import RNBluetoothClassic from 'react-native-bluetooth-classic';
import ThermalPrinter from 'react-native-thermal-printer';
import { Pusher } from '@pusher/pusher-websocket-react-native';
import BluetoothModal from '../../Components/Modal/BluetoothModal';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Sound from 'react-native-sound';
import { PoppinsFont } from '../../Constants/fonts';
import { BluetoothEscposPrinter } from 'react-native-thermal-receipt-printer';

// await BluetoothEscposPrinter.printText(receiptText, {
//   encoding: 'GBK',
//   codepage: 0,
//   widthtimes: 0,
//   heigthtimes: 0,
//   fonttype: 1,
// });

const NewOrdersScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [devices, setDevices] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedMac, setSelectedMac] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isPrintingEnabled, setIsPrintingEnabled] = useState(false);
  const [allPairDevices, setAllPairDevices] = useState([]);
  const [time, setTime] = useState(30);
  const [selectedDepartments, setselectedDepartments] = useState([]);


  const [kitchenSlip, setkitchenSlip] = useState(false)



  const user = useSelector(state => state.auth?.userDetails);
  const orders = useSelector(state => state.auth?.newOrders);
  const printedOrderIdsRef = useRef([]);
  const failedOrderIdsRef = useRef([]);

  const Playbell = () => {
    const bell = new Sound(require('../../assets/ding.mp3'), error => {
      if (error) {
        console.log('Failed to load sound', error);
        return;
      }
      bell.setNumberOfLoops(-1);
      bell.play();

      // Stop after 5 seconds
      setTimeout(() => {
        bell.stop(() => {
          bell.release(); // Free memory
        });
      }, 5000);
    });
  };

  const connectToPussher = async pusher => {
    try {
      const AuthDetails = await AsyncStorage.getItem('AuthDetails')
      const Data = JSON.parse(AuthDetails);
      await pusher.init({
        apiKey: 'a1964c3ac950c1a0cdf5',
        cluster: 'mt1',
      });
      await pusher.subscribe({
        channelName: Data.channel_1,
        onEvent: event => {
          // console.log('Ye Chal Raha ha');
          console.log(`Got channel event: ${event.data}`);
          if (event.eventName === 'new_order') {
            dispatch(getOrders('neworder'));
            Playbell();
          }
        },
      });

      await pusher.connect();
    } catch (error) {
      console.log('connectToPussher error:', error);
    }
  };

  useEffect(() => {
    const pusher = Pusher.getInstance();
    connectToPussher(pusher);
    return async () => {
      await pusher.unsubscribe({ channelName: 'orders' });
      await pusher.disconnect();
    };
  }, []);

  const incrtement = () => {
    setTime(prev => prev + 10);
  };
  const decrement = () => {
    if (time > 0) {
      setTime(prev => prev - 10);
    }
  };

  const handlePrinterCheck = async () => {
    const bondedDevices = await RNBluetoothClassic.getBondedDevices();
    setAllPairDevices(bondedDevices);
  };

  const type = user?.role_id == '1' ? 'kitchen' : null;

  useFocusEffect(

    useCallback(() => {

      navigation.getParent()?.setOptions({
        tabBarStyle: { display: 'flex', backgroundColor: Colors.primary },
        swipeEnabled: true,
      });
      setIsRefreshing(true);
      if (user?.role_id == 2) {
        dispatch(getRiderDeliveries(user.id));
      } else {
        getinitialData()
        dispatch(getOrders('neworder'));
      }
      setIsRefreshing(false);
      fetchDevices();
    }, []),
  );

  const fetchDevices = async () => {
    try {
      const list = await ThermalPrinter.getBluetoothDeviceList();
      console.log('Devices:', list);
      setDevices(list);
      if (list.length > 0) {
        console.log('first');
        // setSelectedMac(list[0].macAddress);
      }
    } catch (err) {
      console.log('Error getting devices', err);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);

    if (user?.role_id == 2) {
      dispatch(getRiderDeliveries(user.id));
    } else {
      dispatch(getOrders('neworder'));
    }

    setIsRefreshing(false);
  };

  async function requestBluetoothPermissions() {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);

      const allGranted = Object.values(granted).every(
        p => p === PermissionsAndroid.RESULTS.GRANTED,
      );
      console.log('allGranted', allGranted);
      return allGranted;
    }

    return true;
  }

  useEffect(() => {
    requestBluetoothPermissions();
  }, []);

  // useEffect(() => {
  //   const loadSavedPrinter = async () => {
  //     try {
  //       const savedMac = await AsyncStorage.getItem('selectedPrinterMac');
  //       console.log('saveMac', savedMac)
  //       if (savedMac) {
  //         setSelectedMac(savedMac);
  //       }
  //     } catch (e) {
  //       console.log('Failed to load selected printer:', e);
  //     }
  //   };
  //   loadSavedPrinter();
  // }, []);

  const handleTogglePrint = async () => {

    setIsPrintingEnabled(prev => {
      const nextValue = !prev;

      if (nextValue) {
        (async () => {
          const connectedPrinter =
            await RNBluetoothClassic.isBluetoothEnabled();
          if (!connectedPrinter) {
            Toast.show('Bluetooth is currently disabled', Toast.SHORT);
            await RNBluetoothClassic.requestBluetoothEnabled();
            setModalVisible(true);
            return;
          }

          // if (!selectedMac) {
          //   // Try to load from storage again (edge case)
          //   const savedMac = await AsyncStorage.getItem('selectedPrinterMac');
          //   if (savedMac) {
          //     setSelectedMac(savedMac);
          //   } else {
          //     setModalVisible(true); // Still not found
          //     return;
          //   }
          // }

          const unprintedOrders = orders?.filter(
            o =>
              !printedOrderIdsRef.current.includes(o.id) &&
              !failedOrderIdsRef.current.includes(o.id),
          );

          if (unprintedOrders?.length > 0) {
            const firstOrder = unprintedOrders[0];
            console.log('Immediately printing first order:', firstOrder.id);
            autoPrintOrder(firstOrder);
          }
        })();
      }

      return nextValue;
    });
  };

  const getinitialData = async () => {
    const departmentsData = await AsyncStorage.getItem('Departments');
    const parsedDepartments = departmentsData
      ? JSON.parse(departmentsData)
      : [];
    setselectedDepartments(parsedDepartments)
    const kitchenSlip = await AsyncStorage.getItem('kitchenSlip');
    setkitchenSlip(kitchenSlip === 'true' ? true : false);
  }


  useEffect(() => {

    if (!isPrintingEnabled) return;

    const interval = setInterval(() => {
      console.log('interval testing')
      if (!orders || orders.length === 0) return;

      // Print new orders not yet printed or failed
      const unprintedOrders = orders.filter(
        o =>
          !printedOrderIdsRef.current.includes(o.id) &&
          !failedOrderIdsRef.current.includes(o.id),
      );

      if (unprintedOrders.length > 0) {
        const orderToPrint = unprintedOrders[0];
        console.log('Auto-printing order:', orderToPrint.id);
        autoPrintOrder(orderToPrint);
        return;
      }

      // Retry failed orders
      if (failedOrderIdsRef.current.length > 0) {
        const retryId = failedOrderIdsRef.current[0];
        const retryOrder = orders.find(o => o.id === retryId);

        if (retryOrder) {
          console.log('Retrying failed order:', retryOrder.id);
          autoPrintOrder(retryOrder);
        }
      }
    }, 15000); // every 15 seconds

    console.log('ye chal raha ha ');
    return () => clearInterval(interval);
  }, [orders, isPrintingEnabled]);

  const autoPrintOrder = async order => {
    try {

      console.log("order data for each order===================", order)

      const connectedPrinter = await RNBluetoothClassic.isBluetoothEnabled();

      if (!connectedPrinter) {
        Toast.show('Bluetooth is currently disabled', Toast.SHORT);
        await RNBluetoothClassic.requestBluetoothEnabled();
        return false;
      }

      const bondedDevices = await RNBluetoothClassic.getBondedDevices();

      if (!bondedDevices || bondedDevices?.length === 0) {
        Toast.show(
          'No paired Bluetooth printer found. Please pair one.',
          Toast.SHORT,
        );

        if (Platform.OS === 'android') {
          RNBluetoothClassic.openBluetoothSettings();
        } else {
          RNBluetoothClassic.openBluetoothSettings();
        }

        return false;
      }

      // if (bondedDevices?.length > 1) {
      //   Toast.show(
      //     'Multiple Bluetooth devices found. Please unpair others to avoid conflict.',
      //     Toast.LONG,
      //   );

      //   if (Platform.OS === 'android') {
      //     RNBluetoothClassic.openBluetoothSettings();
      //   } else {
      //     RNBluetoothClassic.openBluetoothSettings();
      //   }

      //   return false;
      // }

      const selectedPrinter = devices[0];

      // Optional: You may validate the printer name prefix
      // if (!selectedPrinter.deviceName?.toLowerCase().includes('mtp') && !selectedPrinter.deviceName?.toLowerCase().includes('printer')) {
      //   Toast.show('Paired device is not recognized as a printer.', Toast.SHORT);
      //   return;
      // }

      // Set selected MAC address and proceed with print

      // setSelectedMac(selectedPrinter.macAddress);

      const status = order.status === 'neworder' ? 'pending' : order.status;



      dispatch(
        updateOrderStatus(
          status,
          order.id,
          printReceipt,
          async () => {

            const result = await printReceipt(order);
            if (result?.success) {


              if (kitchenSlip) {
                for (const item of order.departments) {
                  console.log('[AutoPrint] Status updated, starting print...', item);
                  if (selectedDepartments.includes(item.department_id)) {
                    await printKitchenReceipt(order, item);
                  }
                }
              }


              console.log('[AutoPrint] Print successful');
              printedOrderIdsRef.current.push(order.id);
              Toast.show('Order printed successfully.', Toast.SHORT);
            } else {
              // console.warn('[AutoPrint] Print failed');
              // Toast.show('Failed to print order.', Toast.SHORT);
              if (!failedOrderIdsRef.current.includes(order.id)) {
                failedOrderIdsRef.current.push(order.id);
              }
            }
          },
          setLoading,
          order,
        ),
      );
    } catch (error) {
      console.log('[AutoPrint] Error during printing:', error?.message);

      if (!failedOrderIdsRef.current.includes(order.id)) {
        failedOrderIdsRef.current.push(order.id);
      }

      if (error?.message === 'User did not enable Bluetooth') {
        setModalVisible(true);
      } else {
        Toast.show(`Print error: ${error.message}`, Toast.SHORT);
      }
    }
  };


  const printKitchenReceipt = async (order, depatment) => {

    const items = order.order_details?.product?.map(product => ({
      qty: product.qty,
      name: product.product_details?.name || 'Unnamed',
      department_id: product.product_details?.department_id,
      department_name: product.product_details?.department_name,
      price: (() => {
        const basePrice = parseFloat(product.price);
        const addons = JSON.parse(product.addons || '[]');
        const types = JSON.parse(product.types || '[]');
        const dressing = JSON.parse(product.dressing || '[]');

        const addonTotal = addons.reduce(
          (sum, a) => sum + parseFloat(a.as_price || 0),
          0,
        );
        const typeTotal = types.reduce(
          (sum, t) => sum + parseFloat(t.price || 0),
          0,
        );
        const dressingTotal = dressing.reduce(
          (sum, d) => sum + parseFloat(d.price || 0),
          0,
        );

        return basePrice + addonTotal + typeTotal + dressingTotal;
      })(),
    }));

    const sub_total = items.reduce(
      (acc, item) => acc + item.price * parseInt(item.qty),
      0,
    );
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
          quantity: a.quantity,
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

    const AuthDetails = await AsyncStorage.getItem('AuthDetails')
    const Data = JSON.parse(AuthDetails);


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
      total: Number(order?.order_total_price) + Number(order?.Shipping_Cost),
      qrCode: order?.qr_code,
    };

    let receiptText = '';
    receiptText += `[C]<b><font size='tall'>${depatment.department_name}</font></b>\n`;
    receiptText += '[L]\n';
    receiptText += `[C]Bestellung Nr: ${orderData.orderNo}\n`;
    receiptText += '------------------------------------------------\n';
    receiptText += `[L]<b><font size='tall'>Produkt</font></b>`;
    receiptText += `[R]<b><font size='tall'>Menge</font></b> \n`;
    receiptText += '------------------------------------------------\n';

    orderData.items.forEach((item, idx) => {
      if (item.department_id === depatment.department_id) {
        receiptText += `[L]<b>${item.name}     [R]x${item.qty}</b>\n`;
        // receiptText += '[L]\n';

        addonData[idx]?.addons?.forEach(addon => {
          receiptText += `[L]<b>x${addon.quantity} ${addon.name}</b>\n`;
          // receiptText += '[L]\n';
        });

        addonData[idx]?.types?.forEach(type => {
          if (type.name) receiptText += `[L]        <b>${type.name}</b>\n`;
          // receiptText += '[L]\n';
        });

        addonData[idx]?.dressing?.forEach(d => {
          if (d.name) receiptText += `[L]           <b>${d.name}</b>\n`;
          // receiptText += '[L]\n';
        });

        receiptText += '------------------------------------------------\n';
      }
    });

    if (order?.order_details?.deals?.length) {
      order?.order_details?.deals.forEach((deal, dealIndex) => {
        const dealInfo = deal.deal_details;
        const dealProducts = deal.deal_product;

        receiptText += `[L]<b>${dealInfo.deal_name} [R]${parseFloat(
          dealInfo.deal_price,
        ).toFixed(2)}</b>\n`;
        // receiptText += '[L]\n';

        dealProducts.forEach((product, productIndex) => {
          receiptText += `[L]<b>${product.product_name}</b>\n`;
          // receiptText += '[L]\n';

          // Addons
          if (product.addons?.length) {
            product.addons.forEach(addon => {
              // const price = addon.as_price === "0" || addon.isFreeInDeal === "1" ? "Free" : `${parseFloat(addon.as_price).toFixed(2)}`;
              receiptText += `[L]        <b>x${addon.quantity} ${addon.as_name}</b>\n`;
              // receiptText += '[L]\n';
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
              // receiptText += '[L]\n';
            });
          }

          // receiptText += '[L]\n';
        });

        receiptText += '------------------------------------------------\n';
      });
    }


    try {

      const result = await ThermalPrinter.printBluetooth({
        payload: receiptText,
        macAddress: selectedMac?.address, // make sure it's trimmed
        printerWidthMM: 80,
        printerNbrCharactersPerLine: 48,
        autoCut: true,
      });
      Toast.show('Your Order has been printed successfully.', Toast.SHORT,);

      console.log('Printed successfully!', result);
    } catch (err) {
      console.log('Failed to print:', JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
      setLoading2(false);
    }
  };

  const printReceipt = async order => {
    const items = order.order_details?.product?.map(product => ({
      qty: product.qty,
      name: product.product_details?.name || 'Unnamed',
      price: (() => {
        const basePrice = parseFloat(product.price);
        const addons = JSON.parse(product.addons || '[]');
        const types = JSON.parse(product.types || '[]');
        const dressing = JSON.parse(product.dressing || '[]');

        const addonTotal = addons.reduce(
          (sum, a) => sum + parseFloat(a.as_price || 0),
          0,
        );
        const typeTotal = types.reduce(
          (sum, t) => sum + parseFloat(t.price || 0),
          0,
        );
        const dressingTotal = dressing.reduce(
          (sum, d) => sum + parseFloat(d.price || 0),
          0,
        );

        return basePrice + addonTotal + typeTotal + dressingTotal;
      })(),
    }));

    const sub_total = items.reduce(
      (acc, item) => acc + item.price * parseInt(item.qty),
      0,
    );
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
          quantity: a.quantity,
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

    const AuthDetails = await AsyncStorage.getItem('AuthDetails')
    const Data = JSON.parse(AuthDetails);

    console.log("The order inside print", JSON.stringify(order))

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
      total: Number(order?.order_total_price) + Number(order?.Shipping_Cost),
      qrCode: order?.qr_code,
    };

    let receiptText = '';
    receiptText += `[C]<b><font size='tall'>${Data.url}</font></b>\n`;
    receiptText += '[L]\n';
    receiptText += `[C]${Data.address}\n`;
    // receiptText += '[L]\n';
    receiptText += `[C]Tel: ${Data.phone}\n`;
    // receiptText += '[L]\n';
    receiptText += `[C]Bestellung Nr: ${orderData.orderNo}\n`;
    // receiptText += '[L]\n';
    receiptText += `[C]Datum: ${orderData.date}\n`;
    // receiptText += '[L]\n';
    receiptText += `[C]Telefon: <b><font size='normal'>${orderData.phone}</font></b>\n`;
    // receiptText += '[L]\n';
    receiptText += `[C]Email: <b><font size='normal'>${orderData.email}</font></b>\n`;
    // receiptText += '[L]\n';
    receiptText += `[C]<p>Adress: <b><font size='normal'>${orderData.shipping}-${orderData.city}</font></b>\n`;
    // receiptText += '[L]\n';
    receiptText += `[C]<p>Name: <b><font size='normal'>${orderData.name}</font></b>\n`;
    // receiptText += '[L]\n';
    // receiptText += `[C]<b></b>\n`;
    // receiptText += '[L]\n';
    receiptText += `[C]<b><font size='normal'>${orderData.postal}</font></b>\n`;
    receiptText += '[L]\n';
    receiptText += `[C]<b>Zahlungsmodus:<font size='normal'>${orderData.payment_type === "cash" ? "Barzahlung" : "Online-Zahlung"}</font></b>\n`;
    receiptText += `[C]<b>Auftragsart:<font size='normal'>${orderData.order_type === "delivery" ? "Lieferung" : "Abholen"}</font></b>\n`;
    // receiptText += `[C]<b>${orderData.shipping_area}</b>\n`;
    // receiptText += '[L]\n';
    // receiptText += `[C]<b>${orderData.add_notes || ''}</b>\n`;
    // receiptText += '[L]\n';
    receiptText += `[C]Befehl Einzelheiten*\n`;
    // receiptText += '[L]\n';
    receiptText += '------------------------------------------------\n';
    receiptText += `<b><font size='tall'>Menge    Produkt                          Preis</font></b> \n`;
    receiptText += '------------------------------------------------\n';

    orderData.items.forEach((item, idx) => {
      receiptText += `[L]<b>x${item.qty}     ${item.name
        } [R]${item.price.toFixed(2)}</b>\n`;
      receiptText += '[L]\n';

      addonData[idx]?.addons?.forEach(addon => {
        receiptText += `[L]        <b>x${addon.quantity} ${addon.name}</b>\n`;
        receiptText += '[L]\n';
      });

      addonData[idx]?.types?.forEach(type => {
        if (type.name) receiptText += `[L]        <b>${type.name}</b>\n`;
        receiptText += '[L]\n';
      });

      addonData[idx]?.dressing?.forEach(d => {
        if (d.name) receiptText += `[L]        <b>${d.name}</b>\n`;
        receiptText += '[L]\n';
      });

      receiptText += '------------------------------------------------\n';
    });

    if (order?.order_details?.deals?.length) {
      order?.order_details?.deals.forEach((deal, dealIndex) => {
        const dealInfo = deal.deal_details;
        const dealProducts = deal.deal_product;

        receiptText += `[L]<b>${dealInfo.deal_name} [R]${parseFloat(
          dealInfo.deal_price,
        ).toFixed(2)}</b>\n`;
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
    // receiptText += '[L]\n';
    receiptText += `[L]<b>Rabatt:</b> [R]<b>${orderData.discount}</b>\n\n`;
    // receiptText += '[L]\n';
    receiptText += `[L]<b>Lieferung:</b> [R]<b>${orderData.delivery}</b>\n\n`;
    // receiptText += '[L]\n';
    receiptText += `[L]<b>MwSt. (7%):</b> [R]<b>${orderData.tax7}</b>\n\n`;
    // receiptText += '[L]\n';
    receiptText += `[L]<b>MwSt. (19%):</b> [R]<b>${orderData.tax19}</b>\n\n`;
    // receiptText += '[L]\n';
    receiptText += '------------------------------------------------\n';
    // receiptText += '[L]\n';
    receiptText += `[L]<b>Gesamt:</b> [R]<b>${orderData.total}</b>\n\n`;

    receiptText += `[L]<b>Zahlungsmethode:</b> [R]<b>${orderData.paymentMethod}</b>\n\n`;
    // receiptText += '[L]\n';

    receiptText += '================================================\n\n';
    receiptText += `[C]<b><font size='big'>Vielen Dank!</font></b>\n\n`;
    receiptText += `[L]<qrcode size='70'>${order?.id}</qrcode>\n`;
    receiptText += `\n\n`;


    try {
      //   setLoading(true);
      //   setLoading2(true);

      //   const bondedDevices = await RNBluetoothClassic.getBondedDevices();
      //   const selectedDevice = bondedDevices.find(d => d.address === selectedMac);

      //   if (!selectedDevice) {
      //     throw new Error(`Device with MAC ${selectedMac} not found among bonded devices.`);
      //   }

      //   const isConnected = await RNBluetoothClassic.isDeviceConnected(selectedMac);
      // await BluetoothEscposPrinter.connectPrinter(selectedMac);

      //   if (!isConnected) {
      //     console.log('Connecting to device...');
      //     await RNBluetoothClassic.connectToDevice(selectedMac);
      //   }

      //   console.log('Sending print data...');
      // await RNBluetoothClassic.writeToDevice(selectedMac, receiptText);
      //   await BluetoothEscposPrinter.printText(receiptText, {
      //   encoding: 'GBK',
      //   codepage: 0,
      //   widthtimes: 0,
      //   heigthtimes: 0,
      //   fonttype: 1,
      // });



      const result = await ThermalPrinter.printBluetooth({
        payload: receiptText,
        macAddress: selectedMac?.address, // make sure it's trimmed
        printerWidthMM: 80,
        printerNbrCharactersPerLine: 48,
        autoCut: true,
        // openCashbox: false, // optional
        // mmFeedPaper: 10, // optional
        // printerDpi: 203, // optional, default is usually 203
      });
      Toast.show('Your Order has been printed successfully.', Toast.SHORT,);

      console.log('Printed successfully!', result);
    } catch (err) {
      console.log('Failed to print:', JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
      setLoading2(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* <CustomButton title="Click" onPress={printReceipt} /> */}

      <FlatList
        style={{ flex: 1, marginTop: verticalScale(10) }}
        data={orders}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <ListComponent
            item={item}
            onPress={() =>
              navigation.navigate('Order Details', { order: item, type })
            }
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => handleRefresh()}
          />
        }
        ListEmptyComponent={
          <View
            style={{
              flex: 1,
              marginTop: '80%',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <MaterialCommunityIcons
              name="file-search-outline"
              color={Colors.primary}
              size={80}
            />
            <Text
              style={{
                alignSelf: 'center',
                marginTop: 15,
                fontSize: 18,
              }}>
              No Order found
            </Text>
          </View>
        }
      />
      <View style={styles.print_button}>
        <TouchableOpacity onPress={handleTogglePrint} style={styles.up}>
          <Text
            style={{
              color: isPrintingEnabled ? Colors.lightprimary : Colors.white,
            }}>
            {
              !selectedMac
                ? "No Printer Selected"
                : isPrintingEnabled
                  ? "Auto Print Enabled"
                  : "Auto Print Disabled"
            }
          </Text>
          <Feather
            name={'printer'}
            size={20}
            color={isPrintingEnabled ? Colors.lightprimary : Colors.white}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={styles.down}>
          <Text style={{ color: Colors.white }}> {selectedMac ? selectedMac?.name : 'Select Printer'}</Text>
          <Feather name={'printer'} size={20} color={Colors.white} />
        </TouchableOpacity>
        <View
          style={{
            flex: 0.3,
            backgroundColor: Colors.backgroundColor,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: scale(10),
          }}>
          <View style={{ marginBottom: 10, }}>
            <Text style={{ color: Colors.grey }}>
              Time To Deliver / Prepare (Minutes)
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <TouchableOpacity
              style={{
                borderWidth: scale(1),
                height: scale(40),
                width: scale(40),
                borderRadius: 10,
                borderColor: '#D1D5DB',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={decrement}>
              <Text style={{ fontSize: scale(25), color: '#000' }}>-</Text>
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
                color: '#000'
              }}>
              <Text style={{ color: '#000' }}>{time}</Text>
            </View>
            <TouchableOpacity
              style={{
                borderWidth: scale(1),
                height: scale(40),
                width: scale(40),
                borderRadius: 10,
                borderColor: '#D1D5DB',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={incrtement}>
              <Text style={{ fontSize: scale(20), color: '#000' }}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <BluetoothModal
        setSelectedMac={setSelectedMac}
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
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

  print_button: {
    position: 'absolute',
    zIndex: 99,
    right: 20,
    bottom: 20,
    gap: 10,
  },
  up: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    backgroundColor: 'rgb(255, 174, 26)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.white,
    flexDirection: 'row',
    gap: 8,
  },
  down: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    backgroundColor: 'rgb(255, 174, 26)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.white,
    flexDirection: 'row',
    gap: 8,
  },
});

export default NewOrdersScreen;
