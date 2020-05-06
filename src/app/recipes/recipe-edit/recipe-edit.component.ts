import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { Recipe } from '../recipe.model';
import * as fromApp from '../../store/app.reducer';
import { map } from 'rxjs/operators';
import * as RecipeActions from '../store/recipe.actions';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-recipe-edit',
  templateUrl: './recipe-edit.component.html',
  styleUrls: ['./recipe-edit.component.css']
})
export class RecipeEditComponent implements OnInit, OnDestroy {
  recipe: Recipe;
  id: number;
  editMode: boolean = false;
  recipeForm: FormGroup;
  storeSubs: Subscription;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private store: Store<fromApp.AppState>) { }

  ngOnInit() {
    this.route.params
      .subscribe((params: Params) => {
          this.id = +params['id'];
          this.editMode = params['id'] != null;
          this.initForm();
        })
  }

  private initForm() {
   
    let recipeName = '';
    let recipeImgPath = '';
    let recipeDescription = '';
    let recipeIngredients = new FormArray([]);

    if (this.editMode) {
      // const recipe = this.recipeService.getRecipe(this.id);
     this.storeSubs = this.store.select('recipes')
      .pipe(
        map(recipesState => {
          return recipesState.recipes.find((recipe, index) => {
            return index === this.id;
          })
      }))
      .subscribe((recipe: Recipe) => {
        recipeName = recipe.name;
        recipeImgPath = recipe.imagePath;
        recipeDescription = recipe.description;
        if (recipe['ingredients']) {
          for (let ingredient of recipe.ingredients) {
            recipeIngredients.push(
              new FormGroup({
                'name': new FormControl(ingredient.name, Validators.required),
                'amount': new FormControl(ingredient.amount, [Validators.required, Validators.pattern(/^0*[1-9]\d*$/)])
              })
            );
          }
        }
      })
    }
    this.recipeForm = new FormGroup({
      'name': new FormControl(recipeName, Validators.required),
      'imagePath': new FormControl(recipeImgPath, Validators.required),
      'description': new FormControl(recipeDescription, Validators.required),
      'ingredients': recipeIngredients
    })
  }

  // get ingredientsCtrls() {
  //   return (<FormArray>this.recipeForm.get('ingredients')).controls;
  // }

  get ingredientsCtrls() {
    return (this.recipeForm.get('ingredients') as FormArray).controls
  }

  onAddIngredient() {
    (<FormArray>this.recipeForm.get('ingredients')).push(
      new FormGroup({
        'name': new FormControl(null, Validators.required),
        'amount': new FormControl(null, [Validators.required, Validators.pattern('^0*[1-9]\d*$')])
      })
    )
  }

  onDeleteIngredient(index: number) {
    (<FormArray>this.recipeForm.get('ingredients')).removeAt(index)
  }

  onCancel() {
    this.router.navigate(['../'], {relativeTo: this.route});
  }
    

  onSumbit() {
    // const value = this.recipeForm.value; //not neccesary because the form.value has the same shape as Recipe
    // const recipe = new Recipe(value.name, value.description, value.imagePath, value.ingredients)
    if (this.editMode) {
      this.store.dispatch(new RecipeActions.UpdateRecipe(
        {
          recipe: this.recipeForm.value, 
          index: this.id
        }
      ))
  
    } else {
      this.store.dispatch(new RecipeActions.AddRecipe(this.recipeForm.value))
    }
    this.onCancel();
  }

  ngOnDestroy() {
    if (this.storeSubs) {
      this.storeSubs.unsubscribe();
    }
  }

} 
