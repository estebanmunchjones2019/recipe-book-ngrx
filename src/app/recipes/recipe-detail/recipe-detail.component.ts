import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';


import { Recipe } from '../recipe.model';
import * as ShoppinListActions from '../../shopping-list/store/shopping-list.actions';
import * as fromApp from '../../store/app.reducer';
import { map, switchMap, subscribeOn } from 'rxjs/operators';
import * as RecipeActions from '../store/recipe.actions';

@Component({
  selector: 'app-recipe-detail',
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.css']
})
export class RecipeDetailComponent implements OnInit {
  recipe: Recipe;
  id: number;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private store: Store<fromApp.AppState>) { }

  ngOnInit() {
    // this.route.params------------Alternative way------------------------//
    //   .subscribe((params) => {
    //     this.id = +params['id'];
    //     // this.recipe = this.recipesService.getRecipe(this.id);
    //     this.store
    //     .select('recipes')
    //     .pipe(
    //       map(recipesState => {
    //         return recipesState.recipes.find((recipe, index) => {
    //           return index === this.id;
    //       })
    //     }))
    //     .subscribe((recipe: Recipe) => {
    //       this.recipe = recipe;
    //     })
    // })

    this.route.params
    .pipe(
      map(params => params['id']),
      switchMap(id => {
        this.id = +id;
        return this.store.select('recipes')
      }),
      map(recipesState => {
        return recipesState.recipes.find((recipe, index) => {
          return index === this.id;
        })
      }) 
    )
    .subscribe((recipe: Recipe) => {
      this.recipe = recipe
    })
  }

  onAddIngredients(){
      this.store.dispatch(new ShoppinListActions.AddIngredients(this.recipe.ingredients));
  }

  onDeleteRecipe() {
    this.store.dispatch(new RecipeActions.DeleteRecipe(this.id));
    this.router.navigate(['/recipes']);
  }

  // onEditButtonClick() { the programatically way of navigating, insted id routerLink.
  //   this.router.navigate(['../', this.id, 'edit'], {relativeTo: this.route} );
  // or this.router.nabigate(['edit'], {relativeTo: this.route} )
  // }
    
}
