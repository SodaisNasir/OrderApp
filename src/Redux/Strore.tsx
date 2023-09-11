import {configureStore, applyMiddleware, Store,} from "@reduxjs/toolkit"
import thunk from "redux-thunk"
import thunkMiddlware from "redux-thunk"
import { composeWithDevTools } from 'redux-devtools-extension';
import rootReducer from "./Reducers";

const composedEnhancer = composeWithDevTools(applyMiddleware(thunk));

const store: Store<HolderState> = configureStore({
    reducer:rootReducer,  middleware: [thunkMiddlware],  enhancers: [composedEnhancer]});

export default store;