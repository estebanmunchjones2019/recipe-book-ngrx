import { Action } from '@ngrx/store';
import { Ingredient } from 'src/app/shared/ingredient.model';

export const ADD_INGREDIENT = '[Shopping List] Add_Ingredient';
export const ADD_INGREDIENTS = '[Shopping List] Add_Ingredients';
export const UPDATE_INGREDIENT = '[Shopping List] Update_Ingredient';
export const DELETE_INGREDIENT = '[Shopping List] Delete_Ingredient';
export const START_EDIT = '[Shopping List] Start_Edit';
export const STOP_EDIT = '[Shopping List] Stop_Edit';

export class AddIngredient implements Action {
    readonly type = ADD_INGREDIENT;
    
    constructor(public payload: Ingredient) {} //it's public because this property is accessed in the reducer, to add that ingredient to the state
    
}

export class AddIngredients implements Action {
    readonly type = ADD_INGREDIENTS;

    constructor(public payload: Ingredient[]) {}
}

export class UpdateIngredient implements Action {
    readonly type = UPDATE_INGREDIENT;

    constructor(public payload: Ingredient) {}
}

export class DeleteIngredient implements Action {
    readonly type = DELETE_INGREDIENT;
}

export class StartEdit implements Action {
    readonly type = START_EDIT;

    constructor(public payload: number) {}
}

export class StopEdit implements Action {
    readonly type = STOP_EDIT;
}


export type ShoppingListActions = 
| AddIngredient 
| AddIngredients 
| UpdateIngredient 
| DeleteIngredient
| StartEdit
| StopEdit;
