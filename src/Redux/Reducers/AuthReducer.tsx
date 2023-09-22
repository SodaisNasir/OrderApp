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

type AuthAction =
  | LoginAction
  | NewOrderAction
  | InProgressOrderAction
  | CompletedOrderAction;

const initialState:
  | UserDetails
  | NewOrderState
  | InProgressOrderState
  | CompletedOrderState
  | null = null;

const authReducer = (
  state:
    | UserDetails
    | NewOrderState
    | InProgressOrderState
    | CompletedOrderState
    | null = initialState,
  action: AuthAction,
):
  | UserDetails
  | NewOrderState
  | InProgressOrderState
  | CompletedOrderState
  | null => {
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
    // Handle other action types here
    default:
      return state;
  }
};

export default authReducer;

