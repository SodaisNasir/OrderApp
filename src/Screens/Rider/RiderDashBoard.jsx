import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Camera} from 'react-native-camera-kit';
import {Colors} from '../../../important/Colors';
import {moderateScale, scale} from 'react-native-size-matters';
import {useDispatch, useSelector} from 'react-redux';
import {apiUrl} from '../../../important/Urls';

const RiderDashBoard  = ({navigation}) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth?.userDetails);
  const [scanEnabled, setScanEnabled] = useState(true);
  const [data, setData] = useState(0);

  const navigateNext = async event => {
    if (scanEnabled && data === 0) {
      setScanEnabled(false);
      try {
        // console.log(
        //   '===================================================================',
        // );
        // console.log(
        //   'event.nativeEvent.codeStringValue ==>',
        //   event.nativeEvent.codeStringValue,
        // );
        // console.log(
        //   '===================================================================',
        // );
        // console.log('v',   `${apiUrl}store-rider-order/${user.id}/${event.nativeEvent.codeStringValue}`);
        var myHeaders = new Headers();

        myHeaders.append(
          'Authorization',
          'Bearer 9H$7sT#kP&5A@N*3L6X8Y2Z1W!V0UQJRB',
        );

        var requestOptions = {
          method: 'POST',
          headers: myHeaders,
          redirect: 'follow',
        };
        // console.log(`${apiUrl}store-rider-order/${user.id}/${event.nativeEvent.codeStringValue}`);
        
        const response = await fetch(
          `${apiUrl}store-rider-order/${user.id}/${event.nativeEvent.codeStringValue}`,
          requestOptions,
        );
        const responseData = await response.json();
        // console.log('responseData', responseData)
        if (responseData.error) {
          alert('Order has alreay been Shipped!');
        } else {
          const CurrentDeliveryAction  = {
            type: 'CURRENTDELIVERY',
            payload: responseData.success.order,
          };
          dispatch(CurrentDeliveryAction);
          setData(parseInt(event?.nativeEvent?.codeStringValue));
        }
      } catch (error) {
        console.log('v error', error)
        // console.log('error', JSON.stringify(error,null,2))
        alert(error);
      } finally {
        setScanEnabled(true);
      }
    } else {
      console.log('laraaaib ===>');
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.scannerBox}>
        <Camera
          scanBarcode={scanEnabled}
          allowCaptureRetake={false}
          onReadCode={event => {
            if (scanEnabled) navigateNext(event);
          }}
          showFrame={true}
          frameColor={Colors.primaryOrg}
          laserColor="#2FB071"
          style={styles.camera}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerBox: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    overflow: 'hidden',
    borderRadius: 16,
    backgroundColor: '#000',
  },
  camera: {
    width: 200,
    height: 200,
  },
  titleText: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: moderateScale(20),
  },
  inputStyles: {marginVertical: scale(20)},
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

export default RiderDashBoard;
