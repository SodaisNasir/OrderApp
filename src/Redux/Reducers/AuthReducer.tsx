// State Interfaces
interface UserDetails {
  userDetails: any;
}

interface NewOrderState {
  newOrders: any[];
}

interface InProgressOrderState {
  inProgressOrders: any[];
}

interface CompletedOrderState {
  completedOrders: any[];
}
interface CurrentaDeliveryState {
  currentDelivery: any;
}

// Action Interfaces
interface LoginAction {
  type: 'LOGIN';
  payload: object;
}

interface NewOrderAction {
  type: 'NEWORDERS';
  payload: any[];
}

interface InProgressOrderAction {
  type: 'INPROGRESSORDERS';
  payload: any[];
}

interface CompletedOrderAction {
  type: 'COMPLETEORDERS';
  payload: any[];
}

interface CurrentaDeliveryAction {
  type: 'CURRENTDELIVERY';
  payload: any;
}

type AuthAction =
  | LoginAction
  | NewOrderAction
  | InProgressOrderAction
  | CompletedOrderAction
  | CurrentaDeliveryAction;

const initialState:
  | UserDetails
  | NewOrderState
  | InProgressOrderState
  | CompletedOrderState
  | CurrentaDeliveryState
  | null = null;

const authReducer = (
  state:
    | UserDetails
    | NewOrderState
    | InProgressOrderState
    | CompletedOrderState
    | CurrentaDeliveryState
    | null = initialState,
  action: AuthAction,
):
  | UserDetails
  | NewOrderState
  | InProgressOrderState
  | CompletedOrderState
  | CurrentaDeliveryState
  |null => {
  switch (action.type) {
    case 'LOGIN':
      return {
        userDetails: action.payload,
      };
    case 'NEWORDERS':
      return {
        ...state,
        newOrders: action.payload,
      };
    case 'INPROGRESSORDERS':
      return {
        ...state,
        inProgressOrders: action.payload,
      };
    case 'COMPLETEORDERS':
      return {
        ...state,
        completedOrders: action.payload,
      };
    case 'CURRENTDELIVERY':
      return {
        ...state,
        currentDelivery: action.payload,
      };
    // Handle other action types here
    default:
      return state;
  }
};

export default authReducer;
