const searchBtn = document.getElementById('search-btn');
const searchInput = document.getElementById('search-input');
const recipesList = document.querySelector('.recipes-list');
const recipeDetails = document.querySelector('.recipe-details');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pagination = document.querySelector('.pagination');

let currentPage = 1;
const recipesPerPage = 5;
let totalRecipes = 0;
let recipes = [];

searchBtn.addEventListener('click', fetchRecipes);

function fetchRecipes(event) {
    event.preventDefault(); // Prevent form submission
    const query = searchInput.value;
    fetch(`https://forkify-api.herokuapp.com/api/v2/recipes?search=${query}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'fail' || !data.data.recipes.length) {
                alert('No recipes found. Please try another search term.');
                recipes = [];
                totalRecipes = 0;
                displayRecipes([]);
                pagination.style.display = 'none';
            } else {
                recipes = data.data.recipes;
                totalRecipes = recipes.length;
                displayRecipes();
                searchInput.value = "";
                updatePagination();
                pagination.style.display = 'flex';
            }
        })
        .catch(error => console.error('Error fetching recipes:', error));
}

function displayRecipes() {
    recipesList.innerHTML = '';
    const start = (currentPage - 1) * recipesPerPage;
    const end = Math.min(start + recipesPerPage, totalRecipes);
    const recipesToDisplay = recipes.slice(start, end);
    
    recipesToDisplay.forEach(recipe => {
        const recipeItem = document.createElement('li');
        recipeItem.classList.add('recipe-item');
        recipeItem.innerHTML = `
            <img class="recipe-img" src="${recipe.image_url}" alt="${recipe.title}">
            <span class="recipe-title">${recipe.title}</span>
        `;
        recipeItem.addEventListener('click', () => fetchRecipeDetails(recipe.id));
        recipesList.appendChild(recipeItem);
    });
}

function updatePagination() {
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === Math.ceil(totalRecipes / recipesPerPage);
}

function handlePageChange(change) {
    // Disable buttons temporarily
    prevPageBtn.disabled = true;
    nextPageBtn.disabled = true;

    // Change the page
    currentPage += change;
    displayRecipes();
    updatePagination();

    // Re-enable buttons after a short delay
    setTimeout(() => {
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === Math.ceil(totalRecipes / recipesPerPage);
    }, 300); // Delay in milliseconds
}

prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        handlePageChange(-1);
    }
});

nextPageBtn.addEventListener('click', () => {
    if (currentPage < Math.ceil(totalRecipes / recipesPerPage)) {
        handlePageChange(1);
    }
});

function fetchRecipeDetails(id) {
    fetch(`https://forkify-api.herokuapp.com/api/v2/recipes/${id}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'fail') {
                alert('Recipe details not found. Please try another recipe.');
            } else {
                displayRecipeDetails(data.data.recipe);
            }
        })
        .catch(error => console.error('Error fetching recipe details:', error));
}

function displayRecipeDetails(recipe) {
    const ingredients = recipe.ingredients.map(ing => `<li class="recipe__ingredient-item">${ing.quantity ? ing.quantity : ''} ${ing.unit ? ing.unit : ''} ${ing.description}</li>`).join('');
    const instructions = recipe.instructions ? recipe.instructions : recipe.description ? recipe.description : 'No instructions available.';
    
    recipeDetails.innerHTML = `
        <img src="${recipe.image_url}" alt="${recipe.title}" class="recipe__img">
        <h2 class="recipe__title">${recipe.title}</h2>
        <p class="recipe__publisher"><strong>Publisher:</strong> ${recipe.publisher}</p>
        <div class="recipe__info">
            <p class="recipe__info-text"><strong>Cooking Time:</strong> ${recipe.cooking_time} minutes</p>
            <p class="recipe__info-text"><strong>Servings:</strong> ${recipe.servings}</p>
        </div>
        <h3>Ingredients:</h3>
        <ul class="recipe__ingredient-list">${ingredients}</ul>
        <h3>Instructions:</h3>
        <p>${instructions}</p>
        <h3>Source URL:</h3>
        <a href="${recipe.source_url}" target="_blank">${recipe.source_url}</a>
    `;
}
