'use strict';

let numberOfImages = 3;
const apiKey = 'a82777318dmsh18dd11e882135a1p1ddf7bjsn2e58b75483aa';

function watchRecipesForm() {
    $('form').submit(function (event) {
        event.preventDefault();
        $('.recipes-list').empty();
        let q = $('#recipes_q').val();
        getRecipes(q);
    })
}

function displayRecipes(recipe) {
    for(let i = 0; i< recipe.results.length; i++){
     $('.recipes-list').append(`<li><h3>${recipe.results[i].title}</h3></li>`);
    }
}

function formatQueryParams(params){
   const queryItems = Object.keys(params)
   .map( function(key){
       encodeURIComponent(key) = encodeURIComponent(params[key]);
   })
   
}

function getRecipes(qry) {
    console.log(`Inside getRecipes ${qry}`);
    $('.recipes').removeClass('hidden');
    const options = {
        headers: new Headers({
          "X-RapidAPI-Key": apiKey})
      };

    const params = {
        query: qry
    }
    if(advancedSearch)
        formatQueryParams(params);
    
    fetch(`https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/search?query=${qry}`,options)
        .then(response => response.json())
        .then(responseJson => {
            console.log(responseJson);
            $('.images').removeClass('hidden');
                displayRecipes(responseJson);
        })
        .catch(error => console.log(`getRandomImage error -- ${error}`))

}

function fetchAndDisplayRandomRecipe(){
    
}


$(function () {
    fetchAndDisplayRandomRecipe();
    watchRecipesForm();
});
