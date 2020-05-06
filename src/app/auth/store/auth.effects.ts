import { Actions, ofType, Effect } from '@ngrx/effects';
import { switchMap, catchError, map, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';

import * as AuthActions from './auth.actions';
import { environment }  from '../../../environments/environment';
import { User } from '../user.model';
import { AuthService } from '../auth.service';

export interface AuthResponseData {
    kind: string,
    idToken: string,
    email: string,
    refreshToken: string,
    expiresIn: string,
    localId: string,
    registered?: string 
}

const handleAuthentication = (resData: AuthResponseData) => {
    const tokenExpirationDate = new Date(new Date().getTime() + +resData.expiresIn * 1000);
    const user = new User(
        resData.email, 
        resData.localId, 
        resData.idToken, 
        tokenExpirationDate
    );
    localStorage.setItem('userData', JSON.stringify(user));
    return new AuthActions.AuthenticateSuccess( //map wraps the what is returned in an observable, but catchError doesn't
        {
            email: resData.email, 
            id: resData.localId, 
            token: resData.idToken, 
            tokenExpirationDate: tokenExpirationDate,
            redirect: true
        }
    )
}

const handleError = (errorRes:any) => {
    let errorMessage: string = 'An unknown error occurred';
    if (!errorRes.error || !errorRes.error.error) {
        return of(new AuthActions.AuthenticateFail(errorMessage)) 
    } else {
        switch(errorRes.error.error.message){
            case 'EMAIL_EXISTS' :
            errorMessage = 'The email address is already in use by another account.';
            break;
            case 'OPERATION_NOT_ALLOWED':
            errorMessage = 'Password sign-in is disabled for this project.';
            break;
            case 'TOO_MANY_ATTEMPTS_TRY_LATER':
            errorMessage = 'We have blocked all requests from this device due to unusual activity. Try again later.';
            break;
            case 'EMAIL_NOT_FOUND':
            errorMessage = 'There is no user record corresponding to this identifier. The user may have been deleted.';
            break;
            case 'INVALID_PASSWORD':
            errorMessage = 'The password is invalid or the user does not have a password.';
            break;
            case 'USER_DISABLED':
            errorMessage = 'The user account has been disabled by an administrator.';
            break; //giving too much detail about the error to the user can have security drawbacks, but it's done here for the sake of practicing
        }
        return of(new AuthActions.AuthenticateFail(errorRes.error.error.message));
    }
}

@Injectable()

export class AuthEffects {
   



    @Effect()
    authSignUp = this.actions$.pipe(
        ofType(AuthActions.SIGNUP_START),
        switchMap((authData: AuthActions.SignupStart) => {
            return this.http.post<AuthResponseData>(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.api_key}`, 
                {
                    email: authData.payload.email,
                    password: authData.payload.password,
                    returnSecureToken: true
                })
                .pipe(
                    tap((resData) => {
                        this.authService.setLogoutTimer(+resData.expiresIn * 1000)
                    }),
                     map(resData => {
                    return handleAuthentication(resData);
                }), catchError(error => {
                    return handleError(error);
                   
                }) 
                ) 
        }) 
    ) 
                

    @Effect()
    authLogin = this.actions$.pipe( //ngrx subscribes automatically; This observable must never die, so errors should kill it
        ofType(AuthActions.LOGIN_START),
        switchMap((authData: AuthActions.LoginStart) => {
            return this.http.post<AuthResponseData>(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.api_key}`,
                {
                    email: authData.payload.email,
                    password: authData.payload.password,
                    returnSecureToken: true
                }
            ).pipe( 
                tap(resData => {
                    console.log(+resData.expiresIn)
                    this.authService.setLogoutTimer(+resData.expiresIn * 1000) 
                }),
                map(resData => {
                return handleAuthentication(resData);
            }), catchError(error => {
                return handleError(error);  
               
            }) 
            ) 
        }) 
    ) 

    @Effect({dispatch: false})// to avoid dispatching an action
    authRedirect = this.actions$.pipe(
        ofType(AuthActions.AUTHENTICATE_SUCCESS), tap((authSuccessAction: AuthActions.AuthenticateSuccess) => {
            if (authSuccessAction.payload.redirect) {
                this.router.navigate(['/']); 
            }
        })
    )

    @Effect()
    authAutoLogin = this.actions$.pipe(
        ofType(AuthActions.AUTO_LOGIN), map(() => { 
            const userData: {
                email: string,
                id: string,
                _token: string,
                _tokenExpirationDate: string
              } = JSON.parse(localStorage.getItem('userData'));//convert the string into an object
              if (!userData) {
                return { type: 'DUMMY'}
              }
              const loadedUser = new User(userData.email, userData.id, userData._token, new Date(userData._tokenExpirationDate));
              if (loadedUser.token) {
                const expirationDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
                this.authService.setLogoutTimer(expirationDuration);
                return new AuthActions.AuthenticateSuccess(
                  {
                    email: loadedUser.email,
                    id: loadedUser.id,
                    token: loadedUser.token,
                    tokenExpirationDate: new Date(userData._tokenExpirationDate),
                    redirect: false
                  }
                );
              }
              return { type: 'DUMMY'}

        })
    )

    @Effect({dispatch: false})
    authLogout = this.actions$.pipe(
        ofType(AuthActions.LOGOUT), tap(() => {
            localStorage.removeItem('userData');
            this.authService.clearLogoutTimer();
            this.router.navigate(['auth']);
        })
    )

    constructor(private actions$: Actions, //Actions is an observable that gives me access to all dispatched actions; dolar sign $ is to point that it's an Observable
        private http: HttpClient,
        private router: Router,
        private authService: AuthService) {}   
    
}