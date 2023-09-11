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
           {user?.email == "Kitchen@example.com" && <KitchenTabs/>}
           {user?.email == "rider@example.com" && <RiderTabs/>}
        </NavigationContainer>
    )
}