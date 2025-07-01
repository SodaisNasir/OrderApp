import {NavigationContainer} from '@react-navigation/native';
import { AuthNavigator } from './Auth';
import { useSelector, useDispatch } from "react-redux";
import { RootState } from '../Redux/Reducers';
import { KitchenTabs } from './Orders';

import { RiderTabs } from './Rider';
export const Navigator = ()=>{
const user = useSelector((state)=> state.auth?.userDetails);
console.log("USR ==>",user);

    return (
        <NavigationContainer>
           {!user &&<AuthNavigator/>}
           {user?.role_id == 1 && <KitchenTabs/>}
           {user?.role_id == 2 && <RiderTabs/>}
        </NavigationContainer>
    )
}