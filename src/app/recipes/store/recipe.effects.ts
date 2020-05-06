import { HttpClient } from '@angular/common/http';
import { switchMap, map, withLatestFrom } from 'rxjs/operators';
import { Actions, ofType, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Injectable } from '@angular/core';

import * as RecipesActions from './recipe.actions';
import { Recipe } from '../recipe.model';
import * as fromApp from '../../store/app.reducer';

@Injectable()
export class RecipeEffects {
    @Effect()
    fetchRecipesEffect = this.actions$.pipe(
        ofType(RecipesActions.FETCH_RECIPES),
        switchMap(() => {
            return this.http.get<Recipe[]>('https://ng-recipe-book-e0f27.firebaseio.com/recipes.json')
        }),
        map(recipes => { // I add an ingredients key for each Recipe I fetch, to keep the same shape in case I want to interact with the ingredients
            return recipes.map(recipe => {
              return {
                ...recipe,
                ingredients: recipe.ingredients ? recipe.ingredients : []
              } ;
            })
          }),
        map(recipes => {
            return new RecipesActions.SetRecipes(recipes);
        })
    )

    @Effect({dispatch: false})
    storeRecipes = this.actions$.pipe(
      ofType(RecipesActions.STORE_RECIPES),
      withLatestFrom(
        this.store.select('recipes')
      ),
      switchMap(([actionData, recipesState]) => { //array destructuring syntax

        return this.http.put<any>('https://ng-recipe-book-e0f27.firebaseio.com/recipes.json', recipesState.recipes)
      })
    )


    constructor(private actions$: Actions,
                private http: HttpClient,
                private store: Store<fromApp.AppState>) {}
}