// src/Redux/Store.js

import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './Reducers';

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(), // ✅ correct usage
});

export default store;
