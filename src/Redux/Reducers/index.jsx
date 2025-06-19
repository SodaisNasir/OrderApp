// src/reducers/index.js

import { combineReducers } from 'redux';
import authReducer from './AuthReducer';
// import otherReducer from './otherReducer';

const rootReducer = combineReducers({
  auth: authReducer,
  // other: otherReducer,
  // Add more reducers here
});

export default rootReducer;
