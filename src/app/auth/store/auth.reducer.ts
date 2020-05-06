import { User } from '../user.model';
import * as AuthActions from './auth.actions';

export interface State {
    user: User,
    authError: string,
    loading: boolean
}

const initialState: State = {
    user: null,
    authError: null,
    loading: false
}

export function authReducer (state = initialState, action: AuthActions.AuthActions ) {
    switch(action.type) {
        case AuthActions.AUTHENTICATE_SUCCESS:
            const user = new User(
                action.payload.email, 
                action.payload.id, 
                action.payload.token, 
                action.payload.tokenExpirationDate
            );
            return {
                ...state,
                user, //same as user: user
                authError: null,
                loading: false
            }
        case AuthActions.LOGIN_START:
        case AuthActions.SIGNUP_START:
            return {
                ...state,
                authError: null,
                loading: true
            }
        case AuthActions.AUTHENTICATE_FAIL:
            return {
                ...state,
                user: null,
                authError: action.payload,
                loading: false
            }
        case AuthActions.LOGOUT:
            return {
                ...state,
                user: null,
                loading: false
            }
        case AuthActions.CLEAR_ERROR:
            return {
                ...state,
                user: null,
                authError: null
            } 
    }
    return state; //every time ngrx initializes, it calls every reducer, with an action that triggers the defaul. without this default, we'd lose each state' slices
}