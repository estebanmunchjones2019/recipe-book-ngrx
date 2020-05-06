import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';

import { Ingredient } from '../../shared/ingredient.model';
import * as ShoppingListActions from '../store/shopping-list.actions';
import * as fromApp from '../../store/app.reducer';

@Component({
  selector: 'app-shopping-edit',
  templateUrl: './shopping-edit.component.html',
  styleUrls: ['./shopping-edit.component.css']
})
export class ShoppingEditComponent implements OnInit, OnDestroy {
  @ViewChild('f') seForm: NgForm;
  subscription: Subscription;
  editMode: boolean = false;
  // editedItemIndex: number;
  editedItem: Ingredient;

  constructor(private store: Store<fromApp.AppState>) { }

  ngOnInit() {
    this.subscription = this.store.select('shoppingList')
      .subscribe(
        (stateData) => {
          if (stateData.editedIngredientIndex > -1) {
            this.editMode = true;
            // this.editedItemIndex = stateData.editedIngredientIndex;
            this.editedItem = stateData.editedIngredient;
            this.seForm.setValue({
              name: this.editedItem.name,
              amount: this.editedItem.amount
            })
          } else {
            this.editMode = false;
          }
        }
      )     
  }

  onSubmit(f: NgForm) {
    const value = f.value;
    const newIngredient = new Ingredient(value.name, value.amount);
    if (this.editMode) {
      // this.shoppigListService.updateIngredient(newIngredient, this.editedItemIndex)
      this.store.dispatch(new ShoppingListActions.UpdateIngredient(newIngredient))
    } else {
      // this.shoppigListService.addNewIngredient(newIngredient);
      this.store.dispatch(new ShoppingListActions.AddIngredient(newIngredient));
    }
    f.reset();
    this.editMode = false;
  }

  onDelete() {
    // this.shoppigListService.deleteIngredient(this.editedItemIndex)
    this.store.dispatch(new ShoppingListActions.DeleteIngredient());
    this.onClear()
  }
 
  onClear() {
    this.seForm.reset();
    this.editMode = false;
    this.store.dispatch(new ShoppingListActions.StopEdit());
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.store.dispatch(new ShoppingListActions.StopEdit());
  }

}
