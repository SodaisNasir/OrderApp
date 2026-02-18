// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { apiUrl } from '../../../important/Urls';
// import Toast from 'react-native-simple-toast';

// // LOGIN
// export const Login = (data, setLoader) => {
//   return async (dispatch) => {
//     try {
//       const notification = await AsyncStorage.getItem('onesignaltoken');
//       const formdata = new FormData();
//       formdata.append('email', data.email);
//       formdata.append('password', data.password);
//       formdata.append('notification_token', notification);

//       const requestOptions = {
//         method: 'POST',
//         body: formdata,
//         redirect: 'follow',
//       };
//       console.log('data', data)

//       const response = await fetch(`${apiUrl}login-app`, requestOptions);
//       // console.log('response=========login', response)
//       if (response?.ok) {
//         const data = await response.json();
//         console.log('DATA ==>', data);
//         if (data?.error?.status === 400) {
//           alert(data?.error?.message);
//         } else {
//           await AsyncStorage.setItem('user', JSON.stringify(data?.success?.user));

//           const loginAction = {
//             type: 'LOGIN',
//             payload: data.success.user,
//           };
//           dispatch(loginAction);

//           if (data?.success?.user?.role_id === 2) {
//             dispatch(getRiderDeliveries(data.success.user.id));
//           } else {
//             dispatch(getOrders('delivered'));
//             dispatch(getOrders('pending'));
//             dispatch(getOrders('inprogress'));
//           }
//         }
//       }
//     } catch (error) {
//       console.log('ERROR ==>', error);
//     } finally {
//       if (setLoader) {
//         setLoader(false)
//       }
//     }
//   };
// };

// // GET ORDERS
// export const getOrders = (type, setLoader) => {
//   return async (dispatch) => {
//     try {
//       if (setLoader) {
//         setLoader(true)
//       }
//       const myHeaders = new Headers();
//       myHeaders.append('Authorization', 'Bearer 9H$7sT#kP&5A@N*3L6X8Y2Z1W!V0UQJRB');

//       const formdata = new FormData();
//       formdata.append('status', type);

//       const requestOptions = {
//         method: 'POST',
//         headers: myHeaders,
//         body: formdata,
//         redirect: 'follow',
//       };

//       const response = await fetch(`${apiUrl}get-orders`, requestOptions);
//       console.log('response===========> order A rha hai', response)

//       // console.log('response', response)
//       if (response.ok) {
//         const data = await response.json();
//         // console.log('DATA in getOrders ==>', data.success.user);

//         let OrderAction;

//         if (type === 'neworder') {
//           OrderAction = {
//             type: 'NEWORDERS',
//             payload: data?.success?.user,
//           };
//         } else if (type === 'pending') {
//           OrderAction = {
//             type: 'INPROGRESSORDERS',
//             payload: data?.success?.user,
//           };
//         } else {
//           OrderAction = {
//             type: 'COMPLETEORDERS',
//             payload: data?.success?.user,
//           };
//         }

//         dispatch(OrderAction);
//       }

//     } catch (error) {
//       console.log('error', error)
//     } finally {
//       if (setLoader) {
//         setLoader(false)
//       }
//     }
//   };
// };

// // UPDATE ORDER STATUS
// export const updateOrderStatus = (status, orderId, print, setLoading, order) => {
//   return async (dispatch) => {
//     setLoading(true);
//     try {
//       const myHeaders = new Headers();
//       myHeaders.append('Authorization', 'Bearer 9H$7sT#kP&5A@N*3L6X8Y2Z1W!V0UQJRB');

//       const formdata = new FormData();
//       formdata.append('status', status);

//       const requestOptions = {
//         method: 'POST',
//         headers: myHeaders,
//         body: formdata,
//         redirect: 'follow',
//       };

//       const response = await fetch(`${apiUrl}change-status/${orderId}`, requestOptions);
//       if (response.ok) {
//         const data = await response.json();
//         dispatch(getOrders('delivered'));
//         dispatch(getOrders('neworder'));
//         dispatch(getOrders('pending'));

//         if (status != 'delivered') {
//           print(order);
//         }
//       } else {
//         setLoading(false);
//         alert('something went wrong!');
//       }
//     } catch (error) {
//       setLoading(false);
//       console.log('ERROR ==>', error);
//     }
//   };
// };

// export const orderDelivrdAPI = (status, orderId, print, setLoading, navigation) => {
//   return async (dispatch) => {
//     setLoading(true);
//     try {
//       const myHeaders = new Headers();
//       myHeaders.append('Authorization', 'Bearer 9H$7sT#kP&5A@N*3L6X8Y2Z1W!V0UQJRB');

//       const formdata = new FormData();
//       // console.log('orderId', orderId)
//       // formdata.append('order_id', orderId);
//       // formdata.append('action', status);


//       formdata.append('status', status);

//       const requestOptions = {
//         method: 'POST',
//         headers: myHeaders,
//         body: formdata,
//         redirect: 'follow',
//       };

//       // const response = await fetch(`${apiUrl}POS/update_order_status.php`, requestOptions);
//       // const response = await fetch(`https://foodola.foodola.shop/API/POS/update_order_status.php`, requestOptions);
//       const response = await fetch(`${apiUrl}change-status/${orderId}`, requestOptions);
//       if (response.ok) {
//         const userData = await AsyncStorage.getItem('user');
//         const parseData = JSON.parse(userData)
//         // const data = await response.json();
//         dispatch(getOrders('delivered'));
//         dispatch(getOrders('neworder'));
//         dispatch(getOrders('pending'));

//         dispatch(getRiderOrders('shipped', parseData?.id, setLoading));

//         setTimeout(() => {
//           navigation.goBack()
//           Toast.show('Order has been delivered!', Toast.SHORT);
//         }, 1500);
//         // if(status != 'delivered'){
//         //   print(data.success.qr_code);
//         // }
//       } else {
//         setLoading(false);
//         alert('something went wrong!');
//       }
//     } catch (error) {
//       setLoading(false);
//       console.log('ERROR ==>', error);
//     } finally {
//       setTimeout(() => {
//         setLoading(false);
//       }, 1500);
//     }
//   };
// };

// // GET RIDER DELIVERIES
// export const getRiderDeliveries = (riderID) => {
//   return async (dispatch) => {
//     try {
//       const myHeaders = new Headers();
//       myHeaders.append('Authorization', 'Bearer 9H$7sT#kP&5A@N*3L6X8Y2Z1W!V0UQJRB');

//       const formdata = new FormData();
//       formdata.append('status', 'delivered');

//       const requestOptions = {
//         method: 'POST',
//         headers: myHeaders,
//         body: formdata,
//         redirect: 'follow',
//       };

//       const response = await fetch(`${apiUrl}get-rider-orders/${riderID}`, requestOptions);
//       if (response.ok) {
//         const data = await response.json();

//         const OrderAction = {
//           type: 'COMPLETEORDERS',
//           payload: data.success.data,
//         };
//         dispatch(OrderAction);
//       }
//     } catch (error) {
//       console.log('error', error);
//     }
//   };
// };

// // GET PDF DATA
// export const getPDFData = async (setData, id) => {
//   try {
//     const requestOptions = {
//       method: 'get',
//     };

//     const response = await fetch(
//       `https://foodola.foodola.shop/admin_panel/reciept.php?order_id=${id}`,
//       requestOptions
//     );
//     const responseData = await response.text();
//     setData(responseData);
//   } catch (error) {
//     console.log('getPDFData error', error);
//   }
// };

// export const getRiderOrders = (type, id, setLoad) => {
//   return async (dispatch) => {
//     setLoad(true);
//     var myHeaders = new Headers();
//     myHeaders.append(
//       'Authorization',
//       'Bearer 9H$7sT#kP&5A@N*3L6X8Y2Z1W!V0UQJRB',
//     );
//     console.log('id', id)
//     var formdata = new FormData();
//     formdata.append('status', type);
//     formdata.append('rider_id', id);

//     var requestOptions = {
//       method: 'POST',
//       headers: myHeaders,
//       body: formdata,
//       redirect: 'follow',
//     };
//     const response = await fetch(`${apiUrl}rider-order`, requestOptions);
//     setLoad(false);
//     if (response.ok) {
//       const data = await response.json();
//       // console.log('response ??????????????', JSON.stringify(data))
//       const OrderAction = {
//         type: 'RIDERORDERS',
//         payload: data?.success?.user,
//       };
//       dispatch(OrderAction);

//     } else {
//       const data = await response.json();
//       const OrderAction = {
//         type: 'RIDERORDERS',
//         payload: [],
//       };
//       dispatch(OrderAction);
//     }
//   };
// };





import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiUrl } from '../../../important/Urls';
import Toast from 'react-native-simple-toast';
import { Alert } from 'react-native';

// LOGIN
export const Login = (data, setLoader) => {
  return async (dispatch) => {
    try {
      const notification = await AsyncStorage.getItem('onesignaltoken');
      const formdata = new FormData();
      formdata.append('email', data.email);
      formdata.append('password', data.password);
      formdata.append('notification_token', notification);

      const requestOptions = {
        method: 'POST',
        body: formdata,
        redirect: 'follow',
      };


      // const response = await fetch(${apiUrl}login-app, requestOptions);
      // console.log('response', response)

      const baseUrl = await AsyncStorage.getItem('baseUrl');
      const response = await fetch(`${baseUrl}login-app`, requestOptions);

      // const response = await fetch(${apiUrl}login-app, requestOptions);
      console.log('response=========login', response)

      if (response?.ok) {
        const data = await response.json();
        // console.log('DATA ==>', data);
        if (data?.error?.status === 400) {
          alert(data?.error?.message);
        } else {
          await AsyncStorage.setItem('user', JSON.stringify(data?.success?.user));

          const loginAction = {
            type: 'LOGIN',
            payload: data.success.user,
          };
          dispatch(loginAction);

          if (data?.success?.user?.role_id === 2) {
            dispatch(getRiderDeliveries(data.success.user.id));
          } else {
            dispatch(getOrders('delivered'));
            dispatch(getOrders('pending'));
            dispatch(getOrders('inprogress'));
          }
        }
      }
    } catch (error) {
      console.log('ERROR ==>', error);
    } finally {
      if (setLoader) {
        setLoader(false)
      }
    }
  };
};



export const getDepartment = (setDepartments) => {
  return async (dispatch) => {

    // setLoading(true);
    try {
      const myHeaders = new Headers();
      myHeaders.append('Authorization', 'Bearer 9H$7sT#kP&5A@N*3L6X8Y2Z1W!V0UQJRB');

      const requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow',
      };
      const baseUrl = await AsyncStorage.getItem('baseUrl');


      const response = await fetch(`${baseUrl}departments`, requestOptions);
      // const response = await fetch(${apiUrl}change-status/${orderId}, requestOptions);
      const result = await response.json();
      console.log('get department========================:', result);
      setDepartments(result?.success?.data)


    } catch (error) {
      // setLoading(false);
      console.log('ERROR ======>', error);
    }
  };
};





export const getBaseUrlAPI = async (data, dispatch, setLoader) => {
  try {
    const formdata = new FormData();
    formdata.append('company_email', data.email);
    formdata.append('password', data.password);

    console.log('data.password======================>', data.email, data.password)

    const response = await fetch('https://foodola.foodola.shop/Laravel/api/accounts', {
      method: 'POST',
      body: formdata,
    });

    const result = await response.json();
    console.log('ACCOUNT API RESULT========================:', result);

    if (result?.success?.status === 200 && result?.success?.data?.base_url) {
      const baseUrl = `${result.success.data.base_url}/Laravel/api/`;
      const PdfBaseUrl = `${result.success.data.base_url}`;

      await AsyncStorage.setItem('baseUrl', baseUrl);
      await AsyncStorage.setItem('PdfBaseUrl', PdfBaseUrl);
      const AuthDetails = JSON.stringify(result.success.data);
      await AsyncStorage.setItem('AuthDetails', AuthDetails);
  





      dispatch({
        type: 'GETACCOUNT',
        payload: result.success.data,
      });

      console.log('Base URL saved:', baseUrl);
      return baseUrl;
    } else if (result?.error?.status === 400) {
      Alert.alert(result?.error?.message)
      setLoader(false)
    } else {
      throw new Error('Base URL not found');
    }
  } catch (error) {
    console.log('getBaseUrlAPI error:', error);
    throw error;
  }
};

export const getOrders = (type, setLoader) => {

  return async (dispatch) => {
    try {
      if (setLoader) {
        setLoader(true)
      }
      const myHeaders = new Headers();
      myHeaders.append('Authorization', 'Bearer 9H$7sT#kP&5A@N*3L6X8Y2Z1W!V0UQJRB');

      const formdata = new FormData();
      formdata.append('status', type);

      const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: formdata,
        redirect: 'follow',
      };


      // const response = await fetch(${apiUrl}get-orders, requestOptions);



      const baseUrl = await AsyncStorage.getItem('baseUrl');
      const response = await fetch(`${baseUrl}get-orders`, requestOptions);
      // const response = await fetch(${apiUrl}get-orders, requestOptions);
      // console.log('response===========> order A rha hai', JSON.stringify(response))


    
      if (response.ok) {
        const data = await response.json();
          // console.log('response-==================================================', JSON.stringify(data?.success?.user))
        let OrderAction;

        if (type === 'neworder') {
          OrderAction = {
            type: 'NEWORDERS',
            payload: data?.success?.user,
          };
        } else if (type === 'pending') {
          OrderAction = {
            type: 'INPROGRESSORDERS',
            payload: data?.success?.user,
          };
        } else {
          OrderAction = {
            type: 'COMPLETEORDERS',
            payload: data?.success?.user,
          };
        }

        dispatch(OrderAction);
      }

    } catch (error) {
      console.log('error', error)
    } finally {
      if (setLoader) {
        setLoader(false)
      }
    }
  };
};




export const updateOrderStatus = (status, orderId, print, setLoading, order) => {

  return async (dispatch) => {
    setLoading(true);
    try {
      const myHeaders = new Headers();
      myHeaders.append('Authorization', 'Bearer 9H$7sT#kP&5A@N*3L6X8Y2Z1W!V0UQJRB');

      const formdata = new FormData();
      formdata.append('status', status);

      const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: formdata,
        redirect: 'follow',
      };
      const baseUrl = await AsyncStorage.getItem('baseUrl');
      const response = await fetch(`${baseUrl}change-status/${orderId}`, requestOptions);
      // const response = await fetch(${apiUrl}change-status/${orderId}, requestOptions);
      if (response.ok) {
        const data = await response.json();
        dispatch(getOrders('delivered'));
        dispatch(getOrders('neworder'));
        dispatch(getOrders('pending'));

        if (status != 'delivered') {
          print(data.success.qr_code);
        }
      } else {
        setLoading(false);
        alert('something went wrong!');
      }
    } catch (error) {
      setLoading(false);
      console.log('ERROR ==>', error);
    }
  };
};

export const orderDelivrdAPI = (status, orderId, print, setLoading, navigation) => {
  return async (dispatch) => {
    setLoading(true);
    try {
      const myHeaders = new Headers();
      myHeaders.append('Authorization', 'Bearer 9H$7sT#kP&5A@N*3L6X8Y2Z1W!V0UQJRB');

      const formdata = new FormData();
      // console.log('orderId', orderId)
      // formdata.append('order_id', orderId);
      // formdata.append('action', status);


      formdata.append('status', status);

      const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: formdata,
        redirect: 'follow',
      };

      // const response = await fetch(${apiUrl}POS/update_order_status.php, requestOptions);
      // const response = await fetch(https://foodola.foodola.shop/API/POS/update_order_status.php, requestOptions);
      const baseUrl = await AsyncStorage.getItem('baseUrl');
      const response = await fetch(`${baseUrl}change-status/${orderId}`, requestOptions);
      // const response = await fetch(${apiUrl}change-status/${orderId}, requestOptions);
      if (response.ok) {
        const userData = await AsyncStorage.getItem('user');
        const parseData = JSON.parse(userData)
        // const data = await response.json();
        dispatch(getOrders('delivered'));
        dispatch(getOrders('neworder'));
        dispatch(getOrders('pending'));

        dispatch(getRiderOrders('shipped', parseData?.id, setLoading));

        setTimeout(() => {
          navigation.goBack()
          Toast.show('Order has been delivered!', Toast.SHORT);
        }, 1500);
        // if(status != 'delivered'){
        //   print(data.success.qr_code);
        // }
      } else {
        setLoading(false);
        alert('something went wrong!');
      }
    } catch (error) {
      setLoading(false);
      console.log('ERROR ==>', error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1500);
    }
  };
};

export const getRiderDeliveries = (riderID) => {
  return async (dispatch) => {
    try {
      const myHeaders = new Headers();
      myHeaders.append('Authorization', 'Bearer 9H$7sT#kP&5A@N*3L6X8Y2Z1W!V0UQJRB');

      const formdata = new FormData();
      formdata.append('status', 'delivered');

      const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: formdata,
        redirect: 'follow',
      };
      const baseUrl = await AsyncStorage.getItem('baseUrl');
      const response = await fetch(`${baseUrl}get-rider-orders/${riderID}`, requestOptions);
      // const response = await fetch(${apiUrl}get-rider-orders/${riderID}, requestOptions);
      if (response.ok) {
        const data = await response.json();

        const OrderAction = {
          type: 'COMPLETEORDERS',
          payload: data.success.data,
        };
        dispatch(OrderAction);
      }
    } catch (error) {
      console.log('error', error);
    }
  };
};

export const getPDFData = async (setData, id) => {
  try {
    const requestOptions = {
      method: 'get',
    };

    const PdfBaseUrl = await AsyncStorage.getItem('PdfBaseUrl');
    const response = await fetch(`${PdfBaseUrl}/admin_panel/reciept.php?order_id=${id}`,
      requestOptions
    );
    const responseData = await response.text();
    setData(responseData);
  } catch (error) {
    console.log('getPDFData error', error);
  }
};

export const getRiderOrders = (type, id, setLoad) => {
  return async (dispatch) => {
    setLoad(true);
    var myHeaders = new Headers();
    myHeaders.append(
      'Authorization',
      'Bearer 9H$7sT#kP&5A@N*3L6X8Y2Z1W!V0UQJRB',
    );
    console.log('id', id)
    var formdata = new FormData();
    formdata.append('status', type);
    formdata.append('rider_id', id);

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: formdata,
      redirect: 'follow',
    };
    const baseUrl = await AsyncStorage.getItem('baseUrl');
    const response = await fetch(`${baseUrl}rider-order`, requestOptions);
    // const response = await fetch(${apiUrl}rider-order, requestOptions);
    setLoad(false);
    if (response.ok) {
      const data = await response.json();
      // console.log('response ??????????????', JSON.stringify(data))
      const OrderAction = {
        type: 'RIDERORDERS',
        payload: data?.success?.user,
      };
      dispatch(OrderAction);

    } else {
      const data = await response.json();
      const OrderAction = {
        type: 'RIDERORDERS',
        payload: [],
      };
      dispatch(OrderAction);
    }
  };
};