import { StyleSheet, Text, Pressable, ActivityIndicator } from 'react-native';
import React from 'react';
import { scale, verticalScale } from 'react-native-size-matters';
import Entypo from 'react-native-vector-icons/Entypo';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { Colors } from '../../important/Colors';

const CustomButton = (props) => {
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
          style={{ paddingHorizontal: 5 }}
          name="controller-play"
          color={Colors.SecondaryDarkColor}
          size={20}
        />
      ) : null}
    {props.loader ? 
    <ActivityIndicator size={'small'} color={'white'} />
    :  <Text style={[styles.font, props.textStyle]}>{props.title}</Text>}
      {props.selected ? (
        <AntDesign
          style={{ paddingHorizontal: 5 }}
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
    backgroundColor: Colors.primary,
    height: verticalScale(45),
    flexDirection: 'row',
    overflow: 'hidden',
  },
  font: {
    color: Colors.backgroundColor,
    fontSize: scale(15),
    textTransform: 'capitalize',
    top: 1.5,
  },
});
