import {StyleSheet, Text, Pressable} from 'react-native';
import React from 'react';
import {scale, verticalScale} from 'react-native-size-matters';
import Entypo from 'react-native-vector-icons/Entypo';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { Colors } from '../Constants/Colors';


interface CustomButtonProps {
  disabled?: boolean;
  onPress: () => void;
  ButtonStyle?: object;
  Play?: boolean;
  textStyle?: object;
  title: string;
  selected?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = props => {
  return (
    <Pressable
      android_ripple={{
        color: 'rgba(20, 24, 36, 1)',
        borderless: true,
        foreground: true,
      }}
      disabled={props.disabled}
      onPress={props.onPress}
      style={[styles.containerStyle, props.ButtonStyle]}>
      {props.Play ? (
        <Entypo
          style={{paddingHorizontal: 5}}
          name="controller-play"
          color={Colors.SecondaryDarkColor}
          size={20}
        />
      ) : null}
      <Text style={[styles.font, props.textStyle]}>{props.title}</Text>
      {props.selected ? (
        <AntDesign
          style={{paddingHorizontal: 5}}
          name="checkcircle"
          color={Colors.SecondaryDarkColor}
          size={scale(20)}
        />
      ) : null}
    </Pressable>
  );
};

export default CustomButton;

const styles = StyleSheet.create({
  containerStyle: {
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: scale(100),
    marginTop: verticalScale(5),
    alignSelf: 'center',
    backgroundColor: Colors.textBlue,
    height: verticalScale(45),
    // borderWidth: scale(3),
    flexDirection: 'row',
    overflow: 'hidden',
    // borderColor: Colors.textColor,
  },

  font: {
    color: Colors.backgroundColor,
    fontSize: scale(15),
    textTransform: 'capitalize',
    // fontFamily: Font.Poppins400,
    top: 1.5,
  },
});
