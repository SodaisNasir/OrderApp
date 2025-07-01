import React, { forwardRef, useState } from 'react';
import { useController } from 'react-hook-form';
import { StyleSheet, TextInput, View } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { Colors } from '../../important/Colors';
import Entypo from 'react-native-vector-icons/Entypo';

const CustomTextInput = forwardRef((props, ref) => {
  const { field } = useController({
    control: props.control,
    defaultValue: props.defaultValue || '',
    name: props.name,
    rules: props.rules,
  });

  const [password, setPassword] = useState(true);

  return (
    <View style={[styles.smallbox, props.style]}>
      <TextInput
        onFocus={props.onFocus}
        textContentType={props.textContentType}
        value={field.value}
        ref={ref}
        onChangeText={field.onChange}
        multiline={props.multiline}
        numberOfLines={props.numberOfLines}
        placeholder={props.placeholder}
        placeholderTextColor={Colors.iconBackground}
        style={[styles.InputStyles, props.restyle]}
        secureTextEntry={props.password ? password : false}
        keyboardType={props.keyboardType}
        textAlignVertical={props.textAlignVertical}
        maxLength={props.maxLength}
        cursorColor={Colors.textBlackColor}
        keyboardAppearance="dark"
        selectionColor={Colors.textBlackColor}
      />

      {props.password && (
        <Entypo
          color={Colors.textBlue}
          size={scale(20)}
          onPress={() => setPassword(!password)}
          name={password ? 'eye-with-line' : 'eye'}
        />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  InputStyles: {
    width: '100%',
    height: '100%',
    color: Colors.textBlackColor,
    fontSize: scale(15),
  },
  smallbox: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginTop: verticalScale(5),
    width: '100%',
    paddingHorizontal: moderateScale(15),
    height: verticalScale(42),
    borderWidth: scale(1),
    borderColor: Colors.primaryOrg,
    borderRadius: scale(10),
    backgroundColor: Colors.textColor,
  },
});

export default CustomTextInput;
