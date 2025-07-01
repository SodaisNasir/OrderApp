import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React from 'react';
import {Colors} from '../../important/Colors';

const NewButton = ({
  name,
  bgColor,
  buttonCancell,
  txtColor,
  onpress,
  loader,
}) => {
  const {borderWidth, borderColor} = buttonCancell;
  return (
    <Pressable
      onPress={onpress}
      style={[
        styles.button,
        {
          backgroundColor: bgColor,
          borderWidth: borderWidth,
          borderColor: borderColor,
        },
      ]}>
      {loader ? (
        <ActivityIndicator size={'large'} color={Colors.white} />
      ) : (
        <Text style={[styles.textStyle, {color: txtColor}]}>{name}</Text>
      )}
    </Pressable>
  );
};

export default NewButton;

const styles = StyleSheet.create({
  button: {
    height: 50,
    width: '100%',
    justifyContent: 'center',
    borderRadius: 10,
  },
  textStyle: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
