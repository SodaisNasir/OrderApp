import {NavigationContainer} from '@react-navigation/native';
import { AuthNavigator } from './Auth';
import { useSelector, useDispatch } from "react-redux";
import { RootState } from '../Redux/Reducers';
import { KitchenTabs } from './Orders';

import { RiderTabs } from './Rider';
export const Navigator: React.FC = ()=>{
const user = useSelector((state:RootState)=> state.auth?.userDetails);
console.log("USR ==>",user?.email);

    return (
        <NavigationContainer>
           {!user &&<AuthNavigator/>}
           {user?.role_id == 1 && <KitchenTabs/>}
           {user?.role_id == 2 && <RiderTabs/>}
        </NavigationContainer>
    )
}