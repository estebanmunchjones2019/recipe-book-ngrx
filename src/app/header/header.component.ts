import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';

import * as fromApp from '../store/app.reducer';
import * as AuthActions from '../auth/store/auth.actions';
import * as RecipeActions from '../recipes/store/recipe.actions';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  userSub: Subscription;
  isAuthenticated: boolean = false;

  constructor(private store: Store<fromApp.AppState>) { } 

  ngOnInit(): void {
    this.userSub = this.store.select('auth').subscribe(authState => {
      this.isAuthenticated = !!authState.user   //!user ? false : true;
    })
  }

  onSave() {
    // this.dataStorageService.storeRecipes();
    this.store.dispatch(new RecipeActions.StoreRecipes());
  }

  onFetch() {
    // this.dataStorageService.fetchRecipes().subscribe(); // I subscribe here because I also subscribe in the RecipesResolverService, and the GET request was returned in the DataStorageService
    this.store.dispatch(new RecipeActions.FetchRecipes());
  }

  onLogout() {
    this.store.dispatch(new AuthActions.Logout());

  }

  ngOnDestroy() {
    this.userSub.unsubscribe();  
  }

}
