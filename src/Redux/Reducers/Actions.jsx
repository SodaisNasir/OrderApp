import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiUrl } from '../../../important/Urls';

// LOGIN
export const Login = (data,setLoader) => {
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

      const response = await fetch(`${apiUrl}login-app`, requestOptions);
      // console.log('response', response)
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
    }finally{
      if(setLoader){
        setLoader(false)
      }
    }
  };
};

// GET ORDERS
export const getOrders = (type) => {
  return async (dispatch) => {
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

    const response = await fetch(`${apiUrl}get-orders`, requestOptions);

    // console.log('response', response)
    if (response.ok) {
      const data = await response.json();
      console.log('DATA in getOrders ==>', data.success.user);

      let OrderAction;

      if (type === 'neworder') {
        OrderAction = {
          type: 'NEWORDERS',
          payload: data.success.user,
        };
      } else if (type === 'pending') {
        OrderAction = {
          type: 'INPROGRESSORDERS',
          payload: data.success.user,
        };
      } else {
        OrderAction = {
          type: 'COMPLETEORDERS',
          payload: data.success.user,
        };
      }

      dispatch(OrderAction);
    }
  };
};

// UPDATE ORDER STATUS
export const updateOrderStatus = (status, orderId, print, setLoading) => {
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

      const response = await fetch(`${apiUrl}change-status/${orderId}`, requestOptions);
      if (response.ok) {
        const data = await response.json();
        dispatch(getOrders('delivered'));
        dispatch(getOrders('neworder'));
        dispatch(getOrders('pending'));
        print(data.success.qr_code);
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

// GET RIDER DELIVERIES
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

      const response = await fetch(`${apiUrl}get-rider-orders/${riderID}`, requestOptions);
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

// GET PDF DATA
export const getPDFData = async (setData, id) => {
  try {
    const requestOptions = {
      method: 'get',
    };

    const response = await fetch(
      `https://foodola.foodola.shop/admin_panel/reciept.php?order_id=${id}`,
      requestOptions
    );
    const responseData = await response.text();
    setData(responseData);
  } catch (error) {
    console.log('getPDFData error', error);
  }
};
