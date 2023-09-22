import AsyncStorage from '@react-native-async-storage/async-storage';
import {apiUrl} from '../../Constants/Urls';

export const Login = (data: {email: any; password: any}) => {
  return async (dispatch: any) => {
    try {
      const notification = await AsyncStorage.getItem('onesignaltoken');
      var formdata = new FormData();
      formdata.append('email', data.email);
      formdata.append('password', data.password);
      formdata.append('notification_token', notification);

      var requestOptions = {
        method: 'POST',
        body: formdata,
        redirect: 'follow',
      };

      const response = await fetch(
        'https://sassolution.org/Order_app/api/login-app',
        requestOptions,
      );
      if (response.ok) {
        const data = await response.json();
        console.log('DATA ==>', data.success.user);
        await AsyncStorage.setItem('user', JSON.stringify(data.success.user));

        const loginAction: Login = {
          type: 'LOGIN',
          payload: data.success.user,
        };
        dispatch(loginAction);
        dispatch(getOrders('delivered'));
        dispatch(getOrders('pending'));
        dispatch(getOrders('inprogress'));
      }
    } catch (error) {
      console.log('ERROR ==>', error);
    }
  };
};

// "delivered,pending,inprogress"

export const getOrders = (type: any) => {
  return async (dispatch: any) => {
    var myHeaders = new Headers();
    myHeaders.append(
      'Authorization',
      'Bearer 9H$7sT#kP&5A@N*3L6X8Y2Z1W!V0UQJRB',
    );

    var formdata = new FormData();
    formdata.append('status', type);

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: formdata,
      redirect: 'follow',
    };

    const response = await fetch(`${apiUrl}get-orders`, requestOptions);
    if (response.ok) {
      const data = await response.json();
      console.log('DATA  in getOrders ==>', data.success.user);
      if (type == 'pending') {
        const OrderAction: NewOrderAction = {
          type: 'NEWORDERS',
          payload: data.success.user,
        };
        dispatch(OrderAction);
      } else if (type == 'inprogress') {
        const OrderAction: InProgressOrderAction = {
          type: 'INPROGRESSORDERS',
          payload: data.success.user,
        };
        dispatch(OrderAction);
      } else {
        const OrderAction: CompletedOrderAction = {
          type: 'COMPLETEORDERS',
          payload: data.success.user,
        };
        dispatch(OrderAction);
      }
    }
  };
};

export const updateOrderStatus = (status: string, orderId : string, print : Function) => {
  return async (dispatch: any) => {
    try {
      var myHeaders = new Headers();
      myHeaders.append(
        'Authorization',
        'Bearer 9H$7sT#kP&5A@N*3L6X8Y2Z1W!V0UQJRB',
      );

      var formdata = new FormData();
      formdata.append('status', status);

      var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: formdata,
        redirect: 'follow',
      };

      const response = await fetch(
        `${apiUrl}change-status/${orderId}`,
        requestOptions,
      );
      if (response.ok) {
        const data = await response.json();
        dispatch(getOrders('delivered'));
        dispatch(getOrders('pending'));
        dispatch(getOrders('inprogress'));
        print()
      } else {
        alert('something went wrong!');
     
      }
    } catch (error) {
      console.log('ERROR ==>', error);

    }
  };
};
