import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, View, Text } from 'react-native';
import { Colors } from '../../../important/Colors';
import CustomTextInput from '../../Components/CustomInput';
import { useForm } from 'react-hook-form';
import { moderateScale, scale } from 'react-native-size-matters';
import CustomButton from '../../Components/CustomButton';
import { useDispatch } from 'react-redux';
import { getBaseUrlAPI, Login } from '../../Redux/Reducers/Actions';

const LoginScreen = () => {

  const dispatch = useDispatch();


  const [loader, setLoader] = useState(false)


  const [baseReady, setBaseReady] = useState(false);


  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'all', defaultValues: {
      email: '',
      password: ''
    }
  });




  const handleLogin = async data => {

    setLoader(true)
    try {
      console.log('🔹 Fetching Base URL using:', data.email, data.password);

      const baseUrl = await getBaseUrlAPI(data, dispatch, setLoader);

      console.log('✅ Base URL ready:', baseUrl);

      if (baseUrl) {
        dispatch(Login(data, setLoader));
      } else {
        Alert.alert('Error', 'Base URL not found. Please try again.');
        setLoader(false);
      }
    } catch (error) {
      console.log('Error in handleLogin:', error);
      Alert.alert('Error', 'Failed to connect. Please try again.');
      setLoader(false);
    }

  };


  // const email = 'foodola@gmail.com'
  // const password = 'admin1234'

  // useEffect(() => {
  //   (async () => {
  //     try {
  //       const base = await getBaseUrlAPI(email, password, dispatch);
  //       console.log('Fetched Base URL:', base);
  //       setBaseReady(true);
  //     } catch (error) {
  //       console.log('Base URL fetch failed');
  //     }
  //   })();
  // }, []);

  // const handleLogin = data => {
  //   if (!baseReady) {
  //     alert('Please wait, setting up connection...');
  //     return;
  //   }
  //   setLoader(true);
  //   dispatch(Login(data, setLoader,));
  // };



  // const handleLogin = data => {
  //   setLoader(true)
  //   // const loginAction: Login = {
  //   //   type: 'LOGIN',
  //   //   payload: {
  //   //     // Provide your user details here
  //   //     // For example:
  //   //     id: 1,
  //   //     username: 'john_doe',
  //   //     email: data.email,
  //   //   },
  //   // };
  //   // console.log('first',data)
  //   dispatch(Login(data, setLoader));
  //   // dispatch(loginAction);
  // };

  const [index, setIndex] = useState(100);
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
                value: /^\w+([.-]?\w+)@\w+([.-]?\w+)(\.\w{2,3})+$/,
                message: 'Email is not valid',
              },
            }}
            placeholder="Email Address"
          />
          {errors.email && (
            <Text style={{ color: Colors.buttongrad1 }}>
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
            restyle={{ width: '90%' }}
            placeholder="Password"
            maxLength={20}
            placeholderTextColor={'#32323266'}
          />
          {errors.password && (
            <Text style={{ color: Colors.buttongrad1 }}>
              {errors.password.message}
            </Text>
          )}
        </View>
        <CustomButton
          onPress={handleSubmit(handleLogin)}
          loader={loader}
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
  inputStyles: { marginBottom: scale(20) },
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
    fontSize: 20,
    fontFamily: 'OpenSans-Bold',
  },
});

export default LoginScreen;