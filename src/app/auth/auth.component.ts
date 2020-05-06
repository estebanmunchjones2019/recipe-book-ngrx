import { Component, OnInit, ComponentFactoryResolver, ViewChild, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { AuthService } from './auth.service';
import { AlertComponent } from '../shared/alert/alert.component';
import { PlaceholderDirective } from '../shared/placeholder.directive';
import * as fromApp from '../store/app.reducer';
import * as AuthActions from './store/auth.actions';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit, OnDestroy {
  @ViewChild(PlaceholderDirective) alertHost: PlaceholderDirective; //viewchild will look for the first occurance of that directive in the DOM
  isLoginMode: boolean = true;
  isLoading: boolean = false;
  error: string = null;
  private closeSub: Subscription;
  private storeSub: Subscription;

  
  constructor(private componentFactoryResolver: ComponentFactoryResolver,
              private store: Store<fromApp.AppState>) { }

  ngOnInit(): void {
    this.storeSub = this.store.select('auth').subscribe(authData => {
      this.isLoading = authData.loading;
      this.error = authData.authError;
      if (this.error) {
        this.showErrorAlert(this.error);
      }
    })
  }

  onClose() {
    this.store.dispatch(new AuthActions.ClearError());
  }

  onSwitch() {
    this.isLoginMode = !this.isLoginMode;
  }

  onSubmit(authForm: NgForm) {
    const email = authForm.value.email;
    const password = authForm.value.password;
 
    if (this.isLoginMode) {
      // authObs = this.authService.login(email, password);
      this.store.dispatch(new AuthActions.LoginStart({email: email, password: password}))
    } else {
      this.store.dispatch(new AuthActions.SignupStart({email: email, password: password}))
    }

    authForm.reset();
  }

  private showErrorAlert(errorMessage: string) {
    // const alertCmp = new AlertComponent(); this won't work because a component in agular is more than just an object, it has to be included in change detection, etc
    const alertCmpFactory = this.componentFactoryResolver.resolveComponentFactory(AlertComponent);
   //alertCmpFactory is an object that knows how to create only AlertComponents
    const hostVcRef = this.alertHost.vsRef;
    hostVcRef.clear();//to clear everything that was previously renderer there;
    const componentRef = hostVcRef.createComponent(alertCmpFactory);
    componentRef.instance.message = errorMessage;
    this.closeSub = componentRef.instance.close.subscribe(() => { //
      this.closeSub.unsubscribe();
      hostVcRef.clear();
    })
  }

  ngOnDestroy() {
    if (this.closeSub) {
    this.closeSub.unsubscribe();
    this.storeSub.unsubscribe();
    }
  }
  
}
