import { Ingredient } from '../../shared/ingredient.model';
import * as ShoppingListActions from './shopping-list.actions';

export interface State {
    ingredients: Ingredient[],
    editedIngredient: Ingredient,
    editedIngredientIndex: number
}

const initialState = {
    ingredients: [
        new Ingredient('Aples', 5),
        new Ingredient('Bananas', 3),
    ],
    editedIngredient: null,
    editedIngredientIndex: -1   
}


export function shoppingListReducer(state = initialState, action: ShoppingListActions.ShoppingListActions) { //ngrx will call this function// state = initialState is a new js feature, to assign a default value in case the arguments is missing (it's gonna be used when the ngrx initializes it's state and calls this function for the first time)
    switch(action.type) {
        case ShoppingListActions.ADD_INGREDIENT:
            return {
                ...state,
                ingredients: [...state.ingredients, action.payload]
            }
        case ShoppingListActions.ADD_INGREDIENTS:
            return {
                ...state,
                ingredients: [...state.ingredients, ...action.payload]
            }
        case ShoppingListActions.UPDATE_INGREDIENT:
            const ingredient = state.ingredients[state.editedIngredientIndex];
            // ingredient.amount NOO! because I'm using the same pointer, affecting inmutability
            //the state should always be copied, and all the nested objects and arrays as well
            const updatedIngredient = {
                ...ingredient, //if there were and id property, I wouldn't lose it
                ...action.payload
            };
            const updatedIngredients = [...state.ingredients];
            updatedIngredients[state.editedIngredientIndex] = updatedIngredient;
            
            return {
               ...state,
               ingredients: updatedIngredients,
               editedIngredientIndex: -1,
               editedIngredient: null
            }
        case ShoppingListActions.DELETE_INGREDIENT:
            // const updatedIngredients2 = [...state.ingredients];
            // updatedIngredients2.splice(action.payload, 1); option 1
            return {
                ...state,
                ingredients: state.ingredients.filter((ingr, index) => { //return a new array, filtering the element we wanna get rid of
                    //state.ingredients.slice().splice(action.payload, 1) should also work
                    return index !== state.editedIngredientIndex;
                }),
                editedIngredientIndex: -1,
               editedIngredient: null
            }
        case ShoppingListActions.START_EDIT:
            return {
                ...state,
                editedIngredient:{...state.ingredients[action.payload]},
                editedIngredientIndex: action.payload
            }
        case ShoppingListActions.STOP_EDIT:
            return {
                ...state,
                editedIngredient: null,
                editedIngredientIndex: -1
            }
        default:
            return state; // it's used the first time we load the shopping-list component 
    }
}