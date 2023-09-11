import React from "react";
import { StyleSheet, View } from "react-native";
import {CameraScreen} from 'react-native-camera-kit';
import { Colors } from "../../Constants/Colors";
import { moderateScale, scale } from "react-native-size-matters";

const RiderDashBoard: React.FC = ({navigation}) =>{
return(

    <View style={styles.container}>
        <CameraScreen
        scanBarcode={true}
        allowCaptureRetake={false}
        // onReadCode={event => navigateNext(event)}
        showFrame={true}
        laserColor="#2FB071"
        // showCapturedImageCount={1}
      />
    </View>
)
}

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