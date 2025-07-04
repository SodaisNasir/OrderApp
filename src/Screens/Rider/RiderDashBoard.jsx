import React, {useCallback, useState} from 'react';
import {StyleSheet, View, PermissionsAndroid, Platform} from 'react-native';
import {Camera} from 'react-native-camera-kit';
import {Colors} from '../../../important/Colors';
import {moderateScale, scale} from 'react-native-size-matters';
import {useDispatch, useSelector} from 'react-redux';
import {apiUrl} from '../../../important/Urls';
import {useFocusEffect} from '@react-navigation/native';

const RiderDashBoard = ({navigation}) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth?.userDetails);
  const [scanEnabled, setScanEnabled] = useState(false);
  const [data, setData] = useState(false);

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'App needs camera access to scan QR codes.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  
  useFocusEffect(
    useCallback(() => {
      navigation.getParent()?.setOptions({
        tabBarStyle: {display: 'flex', backgroundColor: Colors.primary},
        swipeEnabled: true,
      });
      setData(true);
      setScanEnabled(true);
      const enableCamera = async () => {
        const hasPermission = await requestCameraPermission();
        if (hasPermission) {
          setData(true);
          setScanEnabled(true);
        } else {
          alert('Camera permission denied');
        }
      };
      enableCamera();
    }, []),
  );


  const navigateNext = async event => {
    if (scanEnabled) {
      setData(false);
      setScanEnabled(false);
      try {
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
        console.log(
          `${apiUrl}store-rider-order/${user.id}/${event.nativeEvent.codeStringValue}`,
        );

        const response = await fetch(
          `${apiUrl}store-rider-order/${user.id}/${event.nativeEvent.codeStringValue}`,
          requestOptions,
        );
        const responseData = await response.json();
        if (responseData.error) {
          alert('Order has alreay been Shipped!');
          navigation.navigate('Current Delivery');
        } else {
          navigation.navigate('Current Delivery');
        }
      } catch (error) {
        alert(error);
      } finally {
        setScanEnabled(true);
      }
    } else {
      console.log('No More Scan');
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.scannerBox}>
        {scanEnabled && (
          <Camera
            scanBarcode={true}
            allowCaptureRetake={false}
            onReadCode={navigateNext}
            showFrame={true}
            frameColor={Colors.primaryOrg}
            laserColor="#2FB071"
            style={styles.camera}
          />
        )}
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
