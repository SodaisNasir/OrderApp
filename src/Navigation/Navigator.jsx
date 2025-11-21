// import { NavigationContainer } from '@react-navigation/native';
// import { AuthNavigator } from './Auth';
// import { useSelector, useDispatch } from "react-redux";
// import { RootState } from '../Redux/Reducers';
// import { KitchenTabs } from './Orders';

import { useSelector } from "react-redux";
import { AuthNavigator } from "./Auth";
import { KitchenTabs } from "./Orders";
import { RiderTabs } from "./Rider";

// import { RiderTabs } from './Rider';
// export const Navigator = () => {
//     const user = useSelector((state) => state.auth?.userDetails);
//     console.log("USR ==>", user);

//     console.log('user?.role_id=====>', user?.role_id)

//     return (
//         <NavigationContainer>
//             {!user && <AuthNavigator />}
//             {user?.role_id == 1 && <KitchenTabs />}
//             {user?.role_id == 2 && <RiderTabs />}
//         </NavigationContainer>
//     )
// }


// import { AuthNavigator } from './Auth';
// import { useSelector, useDispatch } from "react-redux";
// import { RootState } from '../Redux/Reducers';
// import { KitchenTabs } from './Orders';

// import { RiderTabs } from './Rider';


// export const Navigator = () => {
//     const user = useSelector((state) => state.auth?.userDetails);
//     const GetAccountBaseUrl = useSelector((state) => state.auth?.GetAccount);

//     console.log("USR=====================----------============>", user);

//     console.log('user?.role_id======================================>', GetAccountBaseUrl)



//     return (
//         <>
//             {!user && <AuthNavigator />}
//             {user?.role_id == GetAccountBaseUrl?.role_id && <KitchenTabs />}
//             {user?.role_id == 2 && <RiderTabs />}
//         </>
//     )
// }



export const Navigator = () => {
    const user = useSelector((state) => state.auth?.userDetails);
    const GetAccountBaseUrl = useSelector((state) => state.auth?.GetAccount);

    console.log('GetAccountBaseUrl', user)

    if (!user) {
        return <AuthNavigator />;
    }

    // Kitchen User
    if (user?.role_id == user?.role_id) {
        return <KitchenTabs />;
    }

    // Rider User
    // if (user?.role_id == 2) {
    //     return <RiderTabs />;
    // }

    return null;
};
