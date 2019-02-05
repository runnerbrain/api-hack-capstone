'use strict';

let numberOfImages = 3;
const apiKey = 'a82777318dmsh18dd11e882135a1p1ddf7bjsn2e58b75483aa';
let my_offset = 0;
const max_num = 10;

$("#dialog").dialog({
    title: "Ingredients substitute",
    autoOpen: false,
    dialogClass: 'ingredient-dialog',
    show: {
        effect: "blind",
        duration: 1000
    },
    hide: {
        effect: "fade",
        duration: 1000
    }
});

  function recipeFinderLandingPage() {
    setTimeout(function(){
        $('.landing-page').html(`
            <img class="centered-image w3-center w3-animate-right" src="whatToCook.png" />
            <p class="w3-center w3-animate-right">Get quick ideas for recipes & ingredients to cook a delicious meal and stay Inspired.</p>
            <button class="button button-start w3-center w3-animate-left">Get Started</button>`);
            $('.button-start').on('click', function (event) {
            event.preventDefault();
            handleForm();
            $('.start').empty();
            console.log('start');
        })
    },300);
    
}

function createForm(){
    $('.landing-page').empty();
    $('.recipes-search').append(`    
    <form class="w3-center w3-animate-left" action="">
                <div class="row">
                    <div class="col-12">
                    <label for="recipes_q" class="visuallyhidden">Search term</label>
                        <input type="text" name="recipes_q" id="recipes_q" placeholder="search..." required />
                        <button type="submit"><i class="fa fa-search"></i></button>
                    </div>
                </div>
                <div class="row">     
                </div>
            </form>
            `);
}

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
        event.preventDefault();
        my_offset = my_offset + 10;
        let q = $('#recipes_q').val();
        getRecipes(q, max_num, my_offset);
        $("html, body").animate({ scrollTop: 0 }, "slow");
    })

    $('.recipes-list').on('click', '.recipe_details_link', function (event) {
        event.preventDefault();
        let recipeId = $(this).attr('id');
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

    $('.recipes-list').on('click', '.ingredient', function (event) {
        $("#dialog").empty();
        event.preventDefault();
        let ingredientId = $(this).attr('id');
        fetchIngredientSubstitute(ingredientId);
        $("#dialog").dialog("open");
    });
}


function displayRecipes(recipe, random) {
    if(recipe.totalResults === 0){
        $('.display-area-header').html(`<h1>Recipe Suggestions</h1>`);
        $('.recipes-list').empty();
        $('.recipes-list').append(`<p>No results found !</p>`);
        return;
    }
    if (random) {
        $('.recipes-list').empty();
        $('.recipes-list').append(`
            <h1>Random Recipe</h1>
            <li class="recipe-item">
                <p class="navigate"><button title="Next random recipe" class="button random"><span class="ui-icon ui-icon-arrowthick-1-e"></span></button></p>
                <div class="recipe-header">
                    <div class="recipe-info">
                        <h3 class="recipe-title">${recipe.recipes[0].title}</h3>
                    </div>
                    <img class="recipe-image" src=${recipe.recipes[0].image} />
                </div>        
                <div class="recipe-details-container">        
                    <a href="" title="Show details" id="${recipe.recipes[0].id}" class="recipe_details_link"><i class="material-icons">unfold_more</i></a>
                    <div class="details_area" id="details_area_${recipe.recipes[0].id}">
                        <ul class="recipe_ingredients" id="recipe_ingredients_${recipe.recipes[0].id}"></ul>
                        <p class="recipe_instructions" id="recipe_instructions_${recipe.recipes[0].id}"></p>
                        <p><a href=""  class="details_hide" id="${recipe.recipes[0].id}"><i class="material-icons">expand_less</i></a></p>
                    </div>
                </div>
            </li>`);
        return;
    }
    $('.display-area-header').html(`<h1>Recipe Suggestions</h1>`);
    $('.recipes-list').empty();
    $('#load-more').empty();
    const imag_url_part = 'https://spoonacular.com/recipeImages/';
    for (let i = 0; i < recipe.results.length; i++) {
        if (recipe.results[i].image) {
            $('.recipes-list').append(`
            
            <li class="recipe-item">
                <div class="recipe-header">
                    <div class="recipe-info" id="recipe_info_${recipe.results[i].id}">
                        <h3 class="recipe-title">${recipe.results[i].title}</h3>
                        <div class="recipe-nuggets" id="recipe_nuggets_${recipe.results[i].id}"></div>
                    </div>
                    <img class="recipe-image" src=${imag_url_part}${recipe.results[i].image} />
                </div>
                <div class="recipe-details-container">
                    <a href="" title="Show details" id="${recipe.results[i].id}" class="recipe_details_link"><i class="material-icons">unfold_more</i></a>
                    <div class="details_area" id="details_area_${recipe.results[i].id}">
                        <ul class="recipe_ingredients" id="recipe_ingredients_${recipe.results[i].id}"></ul>
                        <p class="recipe_instructions" id="recipe_instructions_${recipe.results[i].id}"></p>
                        <p><a href=""  class="details_hide" id="${recipe.results[i].id}"><i class="material-icons">expand_less</i></a></p>
                    </div>
                </div>
            </li>
            `);
            fetchRecipeHelpfulInfo(recipe.results[i].id);
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
        if(details.instructions != null)
            $(recipeInstructionsId).append(`${details.instructions}`);
    else
        $(recipeInstructionsId).append(`<p>No Instructions provided...</p>`);

    // let recipeIngredientsId = `#recipe_ingredients_${details.id}`;
    // details.extendedIngredients.forEach(element => {
    //     $(recipeIngredientsId).append(`
    //         <li>${element.name}, (${element.amount} ${element.unit}) <a href="" id="${element.id}" class="ingredient"><i class="material-icons tiny">loop</i></a></li>
    //     `)
    // });
    // let recipeInstructionsId = `#recipe_instructions_${details.id}`;
    // $(recipeInstructionsId).append(`${details.instructions}`);

}

function displayHelpfulInfo(nuggets){
    let recipeInfoId = `#recipe_info_${nuggets.id}`;
    let recipeNuggetsId = `#recipe_nuggets_${nuggets.id}`;
    let recipeSource = nuggets.sourceName;
    let recipeVegan = nuggets.vegan;
    let recipeVegetarian = nuggets.recipeVegetarian
    if(recipeVegan){
        $(recipeNuggetsId).append(`<span>Vegan <i class="material-icons">check</i></span>`)
    }
    else{
        $(recipeNuggetsId).append(`<span>Vegan <i class="material-icons tiny">not_interested</i></span>`)
    }
    if(recipeVegetarian){
        $(recipeNuggetsId).append(`<span>Vegetarian <i class="material-icons">check</i></span>`)
    }
    else{
        $(recipeNuggetsId).append(`<span>Vegetarian <i class="material-icons tiny">not_interested</i></span>`)
    }

    $(recipeInfoId).append(`<p>Source: ${recipeSource}</p>`);
}

function displayIngredientSubstitute(ingredient) {

    if (ingredient.status != 'failure') {
        const ingredientsList = ingredient.substitutes.map((element) => {
            return `<li>${element}</li>`
        })
        $('#dialog').append(ingredientsList.join(''));
    }
    else{
        $('#dialog').append(`No substitute found for this ingredient :( `);
        setTimeout(function(){$('#dialog').dialog('close')},2000);
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

function fetchRecipeHelpfulInfo(recipeId){
    const options = getOptions();
    const url = `https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/${recipeId}/information`;
    fetch(url, options)
    .then(response => response.json())
    .then(responseJson => displayHelpfulInfo(responseJson));
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

function handleForm(){
    createForm();
    fetchAndDisplayRandomRecipe();
    watchRecipesForm();
}


$(recipeFinderLandingPage);