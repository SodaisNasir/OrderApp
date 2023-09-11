
interface UserDetails {
    userDetails: {
        id: number,
        username: string,
        email: string,
      },
}

interface Login {
    type : "LOGIN",
    payload : object

}

type AuthAction = Login

const initialState: UserDetails | null = null;

const authReducer = (state: UserDetails | null = initialState, action: AuthAction ): UserDetails | null => {
    switch (action.type) {
      case 'LOGIN':
        return {
            userDetails : action.payload
        }

      default:
        return state;
    }
  };
  
  export default authReducer;

