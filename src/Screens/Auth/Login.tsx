import React, {useState} from 'react';
import {SafeAreaView, StyleSheet, View, Text} from 'react-native';
import {Colors} from '../../Constants/Colors';
import CustomTextInput from '../../Components/CustomInput';
import {useForm} from 'react-hook-form';
import {moderateScale, scale} from 'react-native-size-matters';
import CustomButton from '../../Components/CustomButton';
import {useDispatch} from 'react-redux';
import { Login } from '../../Redux/Reducers/Actions';

const LoginScreen: React.FC = () => {
  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm({mode: 'all'});
  const dispatch = useDispatch();

  const handleLogin = data => {
    const loginAction: Login = {
      type: 'LOGIN',
      payload: {
        // Provide your user details here
        // For example:
        id: 1,
        username: 'john_doe',
        email: data.email,
      },
    };
dispatch(Login(data));
    // dispatch(loginAction);
  };

  const [index, setIndex] = useState<number>(100);
  return (
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.titleText}>
            <Text style={styles.title}>Login</Text>
          </View>
          <View style={styles.inputStyles}>
            <CustomTextInput
              onFocus={() => {
                setIndex(0);
              }}
              control={control}
              keyboardType="email-address"
              name="email"
              rules={{
                required: '*Email is required',
                pattern: {
                  value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                  message: 'Email is not valid',
                },
              }}
              placeholder="Email Address"
            />
            {errors.email && (
              <Text style={{color: Colors.buttongrad1}}>
                {errors.email.message}
              </Text>
            )}
          </View>
          <View style={styles.inputStyles}>
            <CustomTextInput
              password
              onFocus={() => {
                setIndex(1);
              }}
              control={control}
              name="password"
              rules={{
                required: '*Password is required',
                minLength: {
                  value: 8,
                  message: '*Password too short (minimum length is 8)',
                },
                maxLength: {
                  value: 16,
                  message: '*Password too long (maximum length is 16)',
                },
              }}
              restyle={{width: '90%'}}
              placeholder="Password"
              maxLength={20}
              placeholderTextColor={'#32323266'}
            />
            {errors.password && (
              <Text style={{color: Colors.buttongrad1}}>
                {errors.password.message}
              </Text>
            )}
          </View>
          <CustomButton
            onPress={handleSubmit(handleLogin)}
            //  ButtonStyle={styles.MainContainer}
            title="Log In"
          />
        </View>
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    // alignItems:"center",
    justifyContent: 'center',
  },
  titleText: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: moderateScale(20),
  },
  inputStyles: {marginBottom: scale(20)},
  card: {
    marginHorizontal: 20,
    backgroundColor: Colors.backgroundColor,
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

export default LoginScreen;
