import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { Ingredient } from '../shared/ingredient.model';
import * as fromApp from '../store/app.reducer';
import * as shoppingListActions from './store/shopping-list.actions';

@Component({
  selector: 'app-shopping-list',
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.css']
})
export class ShoppingListComponent implements OnInit, OnDestroy {
  ingredients: Observable<{ingredients: Ingredient[]}>; // as the state is managed in ShoppingListService, I just declare the array, not assign it to =[]
  // getIngredientsSubs: Subscription;
  constructor(private store: Store<fromApp.AppState>) { }

  ngOnInit() {
    this.ingredients = this.store.select('shoppingList'); // this observable is automatically subscribed by the async pipe in the template, and then unsubscribed
    //If I need the ingredients list somewhere else besides the template, I subscribe manually, like usual
    
    // this.ingredients = this.shoppingListService.getIngredients(); //get initial array
    // this.getIngredientsSubs = this.shoppingListService.ingredientAdded.subscribe( //suscribe to changes in the array
    //   (ingredients: Ingredient[]) => this.ingredients = ingredients);
  }

  onEditItem(index: number) {
    this.store.dispatch(new shoppingListActions.StartEdit(index));
  }

  ngOnDestroy() {
    // this.getIngredientsSubs.unsubscribe();
  }
}
