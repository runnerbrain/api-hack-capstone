'use strict';

let numberOfImages = 3;
const apiKey = 'a82777318dmsh18dd11e882135a1p1ddf7bjsn2e58b75483aa';
let my_offset = 0;
const max_num = 10;

$( "#dialog" ).dialog({
    title: "Ingredients substitute",
    autoOpen: false,
    show: {
      effect: "blind",
      duration: 1000
    },
    hide: {
      effect: "fade",
      duration: 1000
    }
  });

function watchRecipesForm() {

    $('form').submit(function (event) {
        event.preventDefault();
        $('.recipes-list').empty();
        let q = $('#recipes_q').val();
        getRecipes(q, max_num, 0);
    })

    $('.recipes-list').on('click', '.random', function (event) {
        event.preventDefault();
        fetchAndDisplayRandomRecipe();
    });

    $('#load-more').on('click', '.next_set', function (event) {
        console.log('clicked');
        event.preventDefault();
        my_offset = my_offset + 10;
        let q = $('#recipes_q').val();
        getRecipes(q, max_num, my_offset);
    })

    $('.recipes-list').on('click', '.recipe_details_link', function (event) {
        event.preventDefault();
        let recipeId = $(this).attr('id');
        console.log(`id is: ${$(this).attr('id')}`);
        $(`#details_area_${recipeId}`).toggle();
        $(`#recipe_ingredients_${recipeId}`).empty();
        $(`#recipe_instructions_${recipeId}`).empty();
        fetchDetails(recipeId);
    })

    $('.recipes-list').on('click', '.details_hide', function (event) {
        event.preventDefault();
        let recipeId = $(this).attr('id');
        $(`#details_area_${recipeId}`).toggle();
    });

    $('.recipes-list').on('click','.ingredient',function(event) {
        $("#dialog").empty();
        event.preventDefault();
        let ingredientId = $(this).attr('id');
        fetchIngredientSubstitute(ingredientId);
        $( "#dialog" ).dialog( "open" );
      });
}

function displayRecipes(recipe, random) {
    if (random) {
        $('.recipes-list').empty();
        $('.recipes-list').append(`
            <li class="recipe-item">
                <p class="navigate"><button class="button random">Next</button></p>
                <div class="recipe-header">
                <div class="recipe-info">
                    <h3 class="recipe-title">${recipe.recipes[0].title}</h3>
                </div>
                    <img class="recipe-image" src=${recipe.recipes[0].image} />
                </div>                
                
                <a href="" id="${recipe.recipes[0].id}" class="recipe_details_link">Details</a>
                <ul class="recipe_ingredients" id="recipe_ingredients_${recipe.recipes[0].id}"></ul>
                <p class="recipe_instructions" id="recipe_instructions_${recipe.recipes[0].id}"></p>
            </li>`);
        return;
    }
    $('.display-area-header').html('Recipes Suggestions:')
    $('.recipes-list').empty();
    $('#load-more').empty();
    const imag_url_part = 'https://spoonacular.com/recipeImages/';
    for (let i = 0; i < recipe.results.length; i++) {
        if (recipe.results[i].image) {
            $('.recipes-list').append(`
            <li class="recipe-item">
                <div class="recipe-header">
                    <div class="recipe-info">
                        <h3 class="recipe-title">${recipe.results[i].title}</h3>
                    </div>
                    <img class="recipe-image" src=${imag_url_part}${recipe.results[i].image} />
                </div>
                <div class="recipe-content">
                    <a href="" id="${recipe.results[i].id}" class="recipe_details_link"><i class="material-icons">unfold_more</i></a>
                    <div class="details_area" id="details_area_${recipe.results[i].id}">
                        <ul class="recipe_ingredients" id="recipe_ingredients_${recipe.results[i].id}"></ul>
                        <p class="recipe_instructions" id="recipe_instructions_${recipe.results[i].id}"></p>
                        <p><a href=""  class="details_hide" id="${recipe.results[i].id}"><i class="material-icons">expand_less</i></a></p>
                    </div>
                </div>
            </li>
            `);
        }
    }
    $('#load-more').append(`<button class="button next_set">Load more</button>`);
}

function displayDetails(details) {
    let recipeIngredientsId = `#recipe_ingredients_${details.id}`;
    details.extendedIngredients.forEach(element => {
        $(recipeIngredientsId).append(`
            <li>${element.name}, (${element.amount} ${element.unit}) <a href="" id="${element.id}" class="ingredient"><span class="ui-icon ui-icon-arrowrefresh-1-s"></span></a></li>
        `)
    });
    let recipeInstructionsId = `#recipe_instructions_${details.id}`;
    $(recipeInstructionsId).append(`${details.instructions}`);

}

function displayIngredientSubstitute(ingredient) {

    if (ingredient) {
        const ingredientsList = ingredient.substitutes.map((element) => {
            return `<li>${element}</li>`
        })
        console.log(ingredientsList.join('')); 
        $('#dialog').append(ingredientsList.join(''));
    }
}

function getOptions() {
    const options = {
        headers: new Headers({
            "X-RapidAPI-Key": apiKey
        })
    };
    return options;
}

function getRecipes(qry, max_num, my_offset) {
    console.log(`Inside getRecipes ${qry}`);
    const options = getOptions();
    fetch(`https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/search?query=${qry}&number=${max_num}&offset=${my_offset}`, options)
        .then(response => response.json())
        .then(responseJson => {
            $('.recipes').removeClass('hidden');
            displayRecipes(responseJson);
        })
        .catch(error => console.log(`getRandomImage error -- ${error}`))
}

function fetchAndDisplayRandomRecipe() {
    const options = getOptions();
    fetch('https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/random?number=1', options)
        .then(response => response.json())
        .then(responseJson => {
            $('.recipes').removeClass('hidden');
            displayRecipes(responseJson, true);
        })
}

function fetchDetails(recipeId) {
    const options = getOptions();
    const url = `https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/${recipeId}/information`;
    fetch(url, options)
        .then(response => response.json())
        .then(responseJson => displayDetails(responseJson));
}

function fetchIngredientSubstitute(ingredientId) {
    const options = getOptions();
    const url = `https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/food/ingredients/${ingredientId}/substitutes`;
    fetch(url, options)
        .then(response => response.json())
        .then(responseJson => {
            displayIngredientSubstitute(responseJson);
        })
}

$(function () {
    fetchAndDisplayRandomRecipe();
    watchRecipesForm();
});