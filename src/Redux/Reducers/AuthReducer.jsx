// const initialState = null;

// const authReducer = (state = initialState, action) => {
//   switch (action.type) {
//     case 'LOGIN':
//       return {
//         userDetails: action.payload,
//       };
//     case 'NEWORDERS':
//       return {
//         ...state,
//         newOrders: action.payload,
//       };
//     case 'INPROGRESSORDERS':
//       return {
//         ...state,
//         inProgressOrders: action.payload,
//       };
//     case 'COMPLETEORDERS':
//       return {
//         ...state,
//         completedOrders: action.payload,
//       };
//     case 'CURRENTDELIVERY':
//       return {
//         ...state,
//         currentDelivery: action.payload,
//       };
//        case 'RIDERORDERS':
//       return {
//         ...state,
//         RiderOrders: action.payload,
//       };
//     default:
//       return state;
//   }
// };

// export default authReducer;

const initialState = {
  userDetails: null,
  GetAccount: null,
  newOrders: null,
  inProgressOrders: null,
  completedOrders: null,
  currentDelivery: null,
  RiderOrders: null,
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {

    case 'GETACCOUNT':
      return {
        ...state,
        GetAccount: action.payload,
      };

    case 'LOGIN':
      return {
        ...state,
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


    case 'RIDERORDERS':
      return {
        ...state,
        RiderOrders: action.payload,
      };

    default:
      return state;
  }
}

export default authReducer
