import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {CameraScreen} from 'react-native-camera-kit';
import {Colors} from '../../Constants/Colors';
import {moderateScale, scale} from 'react-native-size-matters';
import {useDispatch, useSelector} from 'react-redux';
import {apiUrl} from '../../Constants/Urls';

const RiderDashBoard: React.FC = ({navigation}) => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth?.userDetails);
  const [scanEnabled, setScanEnabled] = useState(true);
  const [data, setData] = useState(0);

  const navigateNext = async event => {
    if (scanEnabled && data === 0) {
      setScanEnabled(false);
      try {
        console.log(
          '===================================================================',
        );
        console.log(
          'event.nativeEvent.codeStringValue ==>',
          event.nativeEvent.codeStringValue,
        );
        console.log(
          '===================================================================',
        );
      
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
        console.log(`${apiUrl}store-rider-order/${user.id}/${event.nativeEvent.codeStringValue}`);
        
        const response = await fetch(
          `${apiUrl}store-rider-order/${user.id}/${event.nativeEvent.codeStringValue}`,
          requestOptions,
        );
        const responseData = await response.json();
        if (responseData.error) {
          alert('Order has alreay been Shipped!');
        } else {
          setData(parseInt(event.nativeEvent.codeStringValue));
          const CurrentDeliveryAction: CurrentaDeliveryAction = {
            type: 'CURRENTDELIVERY',
            payload: responseData.success.order,
          };
          dispatch(CurrentDeliveryAction);
        }
      } catch (error) {
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
      <CameraScreen
        scanBarcode={true}
        allowCaptureRetake={false}
        onReadCode={event => navigateNext(event)}
        showFrame={true}
        frameColor={Colors.primaryOrg}
        laserColor="#2FB071"
        // showCapturedImageCount={1}
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
