import React, { useCallback } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { Colors } from '../../Constants/Colors';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { ListComponent } from '../../Components/ListComponent';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { getOrders, getRiderDeliveries } from '../../Redux/Reducers/Actions';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNPrint from 'react-native-print';
import CustomButton from '../../Components/CustomButton';

const NewOrdersScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth?.userDetails);
  const orders = useSelector((state) => state.auth?.newOrders);

  const type = user?.role_id === '1' ? 'kitchen' : null;

  useFocusEffect(
    useCallback(() => {
      navigation.getParent()?.setOptions({
        tabBarLabelStyle: {
          fontSize: scale(8),
          color: Colors.backgroundColor,
        },
        tabBarStyle: {
          backgroundColor: Colors.primary,
        },
        tabBarActiveTintColor: 'red',
        tabBarIndicatorStyle: {
          backgroundColor: 'red',
        },
        swipeEnabled: true,
      });

      if (user?.role_id === 2) {
        dispatch(getRiderDeliveries(user.id));
      } else {
        dispatch(getOrders('neworder'));
      }
    }, [dispatch, navigation, user])
  );


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
                Befehl no: </h3>
            <h3 style="font-size: 14px;font-weight: 800;font-family: math;margin: 3px 0 0 0;"></h3>
            <h3 style="font-size: 14px;font-weight: 800;font-family: math;margin: 3px 0 0 0;">Phone: +4917682540212</h3>
            <h3 style="font-size: 14px;font-weight: 800;font-family: math;margin: 3px 0 0 0;">Email:
                Jonas.bender.1@web.de</h3>
            <h3 style="font-size: 14px;font-weight: 800;font-family: math;margin: 3px 0 0 0;">Address:</h3>
            <h3 style="font-size: 14px;font-weight: 800;font-family: math;margin: 3px 0 0 0;">Name: </h3>
            <h3 style="font-size: 14px;font-weight: 800;font-family: math;margin: 3px 0 0 0;"> </h3>
            <h3 style="font-size: 14px;font-weight: 800;font-family: math;margin: 3px 0 0 0;"> </h3>
            <h3 style="font-size: 14px;font-weight: 800;font-family: math;margin: 3px 0 0 0;"> </h3>
            <h3 style="font-size: 14px;font-weight: 800;font-family: math;margin: 3px 0 0 0;">
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
                            
                        </tbody>
                    </table>
                </div>
            </div>
  
            <div class="footer">
                <ul style="display: flex;list-style: none;padding: 0; font-weight: 700;font-family: sans-serif;">
                    <li style="width: 50%;text-align: left;">Zwischensumme:</li>
                </ul>
            </div>
            <div class="footer">
                <ul style="display: flex;list-style: none;padding: 0; font-weight: 700;font-family: sans-serif;">
                    <li style="width: 50%;text-align: left;">Lieferladegeräte:</li>
                </ul>
            </div>
            <div class="footer">
                <ul style="display: flex;list-style: none;padding: 0; font-weight: 700;font-family: sans-serif;">
                    <li style="width: 50%;text-align: left;">Gesamt:</li>
                </ul>
            </div>
  
            <div class="footer">
                <ul style="display: flex;list-style: none;padding: 0; font-weight: 700;font-family: sans-serif;">
                    <li style="width: 50%;text-align: left;">Bezahlverfahren:</li>
                </ul>
            </div>
            <div class="footer">
                <p style="margin: 10px 0 10px 0; padding: 45px; font-weight: 700;font-family: sans-serif;">Danke für
                    Ihren Einkauf*</p>
            </div>
  
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
      // setLoading(false);
    };

  return (
    <View style={styles.container}>

      <CustomButton title='Click' onPress={printRecpit} />
      {/* <FlatList
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
      /> */}
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
