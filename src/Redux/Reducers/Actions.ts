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

      const response = await fetch(`${apiUrl}login-app`, requestOptions);
      if (response?.ok) {
        const data = await response.json();
        console.log('DATA ==>', data);
        if(data?.error?.status == 400){
          alert(data?.error?.message)
        }else{
          await AsyncStorage.setItem('user', JSON.stringify(data?.success?.user));
  
          const loginAction: Login = {
            type: 'LOGIN',
            payload: data.success.user,
          };
          dispatch(loginAction);
          if (data?.success?.user?.role_id == 2) {
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
      if (type == 'neworder') {
        const OrderAction: NewOrderAction = {
          type: 'NEWORDERS',
          payload: data.success.user,
        };
        dispatch(OrderAction);
      } else if (type == 'pending') {
        const OrderAction: InProgressOrderAction = {
          type: 'INPROGRESSORDERS',
          payload: data.success.user,
        };
        dispatch(OrderAction);
      }else {
        const OrderAction: CompletedOrderAction = {
          type: 'COMPLETEORDERS',
          payload: data.success.user,
        };
        dispatch(OrderAction);
      }
    }
  };
};

export const updateOrderStatus = (
  status: string,
  orderId: string,
  print: Function,
  setLoaging: Function,
) => {
  return async (dispatch: any) => {
    setLoaging(true);
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
        dispatch(getOrders('neworder'));
        dispatch(getOrders('pending'));
        print(data.success.qr_code);
      } else {
        setLoaging(false);
        alert('something went wrong!');
      }
    } catch (error) {
      setLoaging(false);
      console.log('ERROR ==>', error);
    }
  };
};
export const getRiderDeliveries = (riderID: number) => {
  return async (dispatch: any) => {
    try {
      var myHeaders = new Headers();
      myHeaders.append(
        'Authorization',
        'Bearer 9H$7sT#kP&5A@N*3L6X8Y2Z1W!V0UQJRB',
      );

      var formdata = new FormData();
      formdata.append('status', 'delivered');

      var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: formdata,
        redirect: 'follow',
      };

      const response = await fetch(
        `${apiUrl}get-rider-orders/${riderID}`,
        requestOptions,
      );

      if (response.ok) {
        const data = await response.json();

        const OrderAction: CompletedOrderAction = {
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
export const getPDFData = async  ( setData: any,id: any) => {
try {
  var requestOptions = {
    method: 'get',
  };

  const response = await fetch(
    `https://xn--pizzablitzstringen-m3b.de/pizza_blitz/admin_panel/reciept.php?order_id=${id}`,
    requestOptions,
  );
  const responseData = await response.text()
    setData(responseData)
} catch (error) {
  console.log('getPDFData error', error)
}
}