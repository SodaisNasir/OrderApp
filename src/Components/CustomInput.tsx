import React, {forwardRef, useState} from 'react';
import {useController, Control} from 'react-hook-form';
import {StyleSheet, Text, TextInput, View} from 'react-native';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import {Colors} from '../Constants/Colors';
import Entypo from 'react-native-vector-icons/Entypo';

interface CustomInputProps {
  password: boolean;
  control: Control;
  defaultValue?: string;
  name: string;
  rules?: object;
  Heading: string;
  style?: object;
  FontAwesome?: boolean;
  FontAwesome_Name?: string;
  size?: number;
  MaterialIcons?: boolean;
  MaterialIcons_Name?: string;
  Fontisto?: boolean;
  Fontisto_Name?: string;
  onFocus?: () => void;
  textContentType?: string;
  multiline?: boolean;
  numberOfLines?: number;
  placeholder?: string;
  placeholderTextColor?: string;
  Gapp?: object;
  restyle?: object;
  secureTextEntry?: boolean;
  keyboardType?: string;
  textAlignVertical?: string;
  pattern?:
    | RegExp
    | undefined
    | null
    | false
    | true
    | string
    | number
    | object
    | symbol
    | bigint
    | ((...args: any[]) => any)
    | any[];
  label?: string;
  placeholderStyle?: object;
  fontSize?: number;
  maxLength?: number;
  noHeading?: boolean;
  change?: boolean;
}

const CustomTextInput = forwardRef<TextInput, CustomInputProps>(
  (props, ref) => {
    const {field} = useController({
      control: props.control,
      defaultValue: props.defaultValue || '',
      name: props.name,
      rules: props.rules,
    });

    const [password, setPassword] = useState<Boolean>(true);

    return (
      <>
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
            secureTextEntry={props.secureTextEntry}
            keyboardType={props.keyboardType}
            textAlignVertical={props.textAlignVertical}
            pattern={props.pattern}
            label={props.label}
            placeholderStyle={props.placeholderStyle}
            fontSize={props.fontSize}
            maxLength={props.maxLength}
              cursorColor={Colors.textBlackColor}
            keyboardAppearance="dark"
              selectionColor={Colors.textBlackColor}
            secureTextEntry={props.password ? password: false}
          />
         {props.password && <Entypo
            color={Colors.textBlue}
            size={scale(20)}
            onPress={() => setPassword(!password)}
            name={password ? 'eye-with-line' : 'eye'}
          />}
        </View>
      </>
    );
  },
);

const styles = StyleSheet.create({
  InputStyles: {
    width: '100%',
    height: '100%',
    color: Colors.textBlackColor,
    // fontFamily: Font.Gilroy500,
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
    backgroundColor:Colors.textColor
  },
});
export default CustomTextInput;
