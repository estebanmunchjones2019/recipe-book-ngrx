import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';

import * as fromApp from '../../store/app.reducer';
import { Recipe } from '../recipe.model';



@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.css']
})
export class RecipeListComponent implements OnInit, OnDestroy {

  recipes: Recipe[] = [];
  subscription: Subscription;

  constructor(private store: Store<fromApp.AppState>) { }

  ngOnInit(): void {
    // // this.recipes  = this.recipeService.getRecipes();
    // this.recipeChangeSubs = this.recipeService.recipeChanged.subscribe((recipes: Recipe[]) => {
    //   this.recipes = recipes;
    //   console.log(this.recipes);
    // })
    this.subscription = this.store
      .select('recipes')
      .pipe(map(recipesState => recipesState.recipes
      ))
      .subscribe((recipes: Recipe[]) => { 
        this.recipes = recipes;
      })
     
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
