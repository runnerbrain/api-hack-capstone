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
    setTimeout(function () {
        $('.landing-page').html(`
            <img class="centered-image w3-center w3-animate-right" src="whatToCook.png" />
            <p class="w3-center w3-animate-right">Get quick ideas for recipes & ingredients to cook a delicious meal and stay Inspired!</p>
            <button class="button button-start w3-center w3-animate-left">Get Started</button>`);
        $('.button-start').on('click', function (event) {
            event.preventDefault();
            handleForm();
            //$('.start').empty();
        })
    }, 300);

}

function createForm() {
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
        $("html, body").animate({
            scrollTop: 0
        }, "slow");
    })

    $('.recipes-list').on('click', '.recipe_details_link', function (event) {
        event.preventDefault();
        let recipeId = $(this).attr('id');
        $(`#details_area_${recipeId}`).toggle();
        $(`#recipe_ingredients_${recipeId}`).empty();
        $(`#recipe_instructions_${recipeId}`).empty();
        $(`#${recipeId}`).toggle();
        fetchDetails(recipeId);
    })

    $('.recipes-list').on('click', '.details_hide', function (event) {
        event.preventDefault();
        let recipeId = $(this).attr('id');
        $(`#details_area_${recipeId}`).toggle();
        $(`#${recipeId}`).toggle();
    });

    $('.recipes-list').on('click', '.ingredient', function (event) {
        $("#dialog").empty();
        event.preventDefault();
        let ingredientId = $(this).attr('id');
        fetchIngredientSubstitute(ingredientId);
        $("#dialog").dialog("open");
    });
}

function generateRecipeCard(recipeId,recipeTitle,recipeImage){
    $('.recipes-list').append(`
            <li class="recipe-item">
                <div class="random-bar-next"></div>
                <div class="recipe-header">
                    <div class="recipe-info" id="recipe_info_${recipeId}">
                        <h3 class="recipe-title">${recipeTitle}</h3>
                        <div class="recipe-nuggets" id="recipe_nuggets_${recipeId}"></div>
                    </div>
                    <img class="recipe-image" src=${recipeImage} />
                </div>        
                <div class="recipe-details-container">        
                    <a href="" id="${recipeId}" class="recipe_details_link">More...</i></a>
                    <div class="details_area" id="details_area_${recipeId}">
                        <h5>Ingredients:</h5>
                        <ol class="recipe_ingredients" id="recipe_ingredients_${recipeId}"></ol>
                        <h5>Instructions:</h5>
                        <p class="recipe_instructions" id="recipe_instructions_${recipeId}"></p>
                        <p><a href=""  class="details_hide" id="${recipeId}"><i class="material-icons">expand_less</i></a></p>
                    </div>
                </div>
            </li>`);
            fetchRecipeHelpfulInfo(recipeId);
}

function displayRecipes(recipe, random) {
    if (random) {
        $('.display-area-header').html(`<h1>Random Recipes</h1>`);
        $('.recipes-list').empty(); 
        if (recipe.recipes[0].image) {
                generateRecipeCard(recipe.recipes[0].id,recipe.recipes[0].title,recipe.recipes[0].image);
                $('.random-bar-next').append(`<p class="navigate"><a href="" class="random"><i class="material-icons">arrow_forward</i></a></p>`);
        }
        return;
    }
    $('.display-area-header').html(`<h1>Recipe Suggestions</h1>`);
    $('.recipes-list').empty();
    $('#load-more').empty();
    const imag_url_part = 'https://spoonacular.com/recipeImages/';
    for (let i = 0; i < recipe.results.length; i++) {
        if (recipe.results[i].image) {
            let recipeImage = `${imag_url_part}${recipe.results[i].image}`
            generateRecipeCard(recipe.results[i].id,recipe.results[i].title,recipeImage);
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
    if (details.instructions != null)
        $(recipeInstructionsId).append(`${details.instructions}`);
    else
        $(recipeInstructionsId).append(`<p>No Instructions provided...</p>`);

}

function displayHelpfulInfo(nuggets) {
    const recipeInfoId = `#recipe_info_${nuggets.id}`;
    const recipeNuggetsId = `#recipe_nuggets_${nuggets.id}`;
    let recipeSource = nuggets.sourceName;
    if(recipeSource === null)
        recipeSource = '(No source provided)'
    const recipeVegan = nuggets.vegan;
    let recipeVegetarian = nuggets.recipeVegetarian;
    const recipeDairyFree = nuggets.dairyFree;
    const recipeGlutenFree = nuggets.glutenFree;
    const recipeLink = nuggets.sourceUrl;
    if (recipeVegan) {
        recipeVegetarian = true;
        $(recipeNuggetsId).append(`<span>Vegan <i class="material-icons">check</i></span>`)
    } else {
        $(recipeNuggetsId).append(`<span>Vegan <i class="material-icons tiny">not_interested</i></span>`)
    }
    if (recipeVegetarian) {
        $(recipeNuggetsId).append(`<span>Vegetarian <i class="material-icons">check</i></span>`)
    } else {
        $(recipeNuggetsId).append(`<span>Vegetarian <i class="material-icons tiny">not_interested</i></span>`)
    }
    if (recipeDairyFree) {
        $(recipeNuggetsId).append(`<span>Dairy free <i class="material-icons">check</i></span>`)
    } else {
        $(recipeNuggetsId).append(`<span>Dairy free <i class="material-icons tiny">not_interested</i></span>`)
    }
    if (recipeGlutenFree) {
        $(recipeNuggetsId).append(`<span>Gluten free <i class="material-icons">check</i></span>`)
    } else {
        $(recipeNuggetsId).append(`<span>Gluten free <i class="material-icons tiny">not_interested</i></span>`)
    }
    $(recipeInfoId).append(`<span>Source: <a href="${recipeLink}">${recipeSource} <i class="material-icons">link</i></span></a>`);
}

function displayIngredientSubstitute(ingredient) {

    if (ingredient.status != 'failure') {
        const ingredientsList = ingredient.substitutes.map((element) => {
            return `<li>${element}</li>`
        })
        $('#dialog').append(ingredientsList.join(''));
    } else {
        $('#dialog').append(`No substitute found for this ingredient :( `);
        setTimeout(function () {
            $('#dialog').dialog('close')
        }, 2000);
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

function fetchRecipeHelpfulInfo(recipeId) {
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

function handleForm() {
    createForm();
    fetchAndDisplayRandomRecipe();
    watchRecipesForm();
}


$(recipeFinderLandingPage);