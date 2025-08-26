// Configuration and Constants
const CONFIG = {
    API_KEY: "65232507",
    API_PREMIUM_URL: `https://www.themealdb.com/api/json/v1/65232507`,
    API_PUBLIC_URL: "https://www.themealdb.com/api/json/v1/1",
    ITEMS_PER_PAGE: 10,
    MAX_VISIBLE_PAGES: 5
};

// Pagination state
let currentPage = 1;
let allMeals = [];

// DOM Elements Manager
class DOMElements {
    static elements = {};

    static initialize() {
        this.elements = {
            input: document.querySelector(".search-input"),
            title: document.getElementById("mainRecipeTitle"),
            info: document.getElementById("preparationInfo"),
            img: document.getElementById("mainRecipeImage"),
            ingredientsList: document.getElementById("ingredientsList"),
            preparationInfo: document.getElementById("preparationInfo"),
            resultsGrid: document.getElementById("resultsGrid"),
            letterButtons: document.querySelectorAll(".letter-btn"),
            categoryFilter: document.getElementById("categoryFilter"),
            areaFilter: document.getElementById("areaFilter"),
            clearFiltersBtn: document.getElementById("clearFilters"),
            searchFiltersBtn: document.getElementById("searchFiltersBtn"),
            navLinks: document.querySelectorAll(".nav-link")
        };

        this.validateElements();
    }

    static validateElements() {
        const requiredElements = ['input', 'title', 'info', 'img', 'ingredientsList', 'resultsGrid'];
        const missingElements = requiredElements.filter(el => !this.elements[el]);
        
        if (missingElements.length > 0) {
            console.error("Missing required DOM elements:", missingElements);
            throw new Error("Required DOM elements not found");
        }
    }
}

// API Service - Single Responsibility Principle
class APIService {
    static async fetchData(endpoint, usePremium = false) {
        const baseUrl = usePremium ? CONFIG.API_PREMIUM_URL : CONFIG.API_PUBLIC_URL;
        
        try {
            const response = await fetch(`${baseUrl}/${endpoint}`);
            
            if (!response.ok) {
                if (usePremium) {
                    console.log("Premium API failed, trying public API...");
                    return await this.fetchData(endpoint, false);
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error("API fetch error:", error);
            throw error;
        }
    }

    static async searchByCategory(category) {
        return await this.fetchData(`filter.php?c=${encodeURIComponent(category)}`);
    }

    static async searchByArea(area) {
        return await this.fetchData(`filter.php?a=${encodeURIComponent(area)}`);
    }

    static async searchByLetter(letter) {
        return await this.fetchData(`search.php?f=${letter}`);
    }

    static async searchByIngredients(ingredients) {
        return await this.fetchData(`filter.php?i=${encodeURIComponent(ingredients)}`);
    }

    static async getMealDetails(mealId) {
        return await this.fetchData(`lookup.php?i=${mealId}`);
    }

    static async getCategories() {
        return await this.fetchData('categories.php');
    }

    static async getAreas() {
        return await this.fetchData('list.php?a=list');
    }
}

// Recipe Data Manager - Single Responsibility Principle
class RecipeDataManager {
    static async getDetailedMeals(meals) {
        const detailedMeals = [];
        console.log(`Processing ${meals.length} recipes for details...`);
        
        for (const meal of meals) {
            try {
                console.log(`Getting details for recipe: ${meal.idMeal} - ${meal.strMeal}`);
                const mealDetails = await APIService.getMealDetails(meal.idMeal);
                
                if (mealDetails.meals && mealDetails.meals[0]) {
                    detailedMeals.push(mealDetails.meals[0]);
                    console.log(`Details obtained for: ${mealDetails.meals[0].strMeal}`);
                } else {
                    console.warn(`No details found for recipe ${meal.idMeal}`);
                }
            } catch (error) {
                console.warn(`Error processing recipe ${meal.idMeal}:`, error);
                continue;
            }
        }
        
        console.log(`Processing completed. ${detailedMeals.length} recipes with complete details.`);
        return detailedMeals;
    }

    static processIngredients(meal) {
        const ingredients = [];
        
        for (let i = 1; i <= 20; i++) {
            if (meal[`strIngredient${i}`]) {
                const ingredient = meal[`strIngredient${i}`].trim();
                const measure = meal[`strMeasure${i}`] ? meal[`strMeasure${i}`].trim() : '';
                
                if (ingredient && ingredient !== '') {
                    if (measure && measure !== '') {
                        ingredients.push({
                            name: ingredient,
                            measure: measure
                        });
                    } else {
                        ingredients.push({
                            name: ingredient,
                            measure: ''
                        });
                    }
                }
            } else {
                break;
            }
        }
        
        return ingredients;
    }

    static processInstructions(instructions) {
        return instructions.split('.').filter(instruction => instruction.trim() !== '');
    }
}

// UI Manager - Single Responsibility Principle
class UIManager {
    static showMealInfo(meal) {
        const { strMeal, strMealThumb, strInstructions } = meal;
        const elements = DOMElements.elements;
        
        elements.title.textContent = strMeal;
        elements.img.style.backgroundImage = `url(${strMealThumb})`;
        
        // Process instructions with bullet points
        const instructions = RecipeDataManager.processInstructions(strInstructions);
        const instructionsHTML = instructions.map(instruction => 
            `<li>${instruction.trim()}</li>`
        ).join('');
        
        elements.preparationInfo.innerHTML = `<ol class="instructions-list">${instructionsHTML}</ol>`;

        // Process ingredients
        const ingredients = RecipeDataManager.processIngredients(meal);
        const ingredientsHTML = ingredients.map(ingredient => {
            if (ingredient.measure) {
                return `<div class="ingredient-item">
                    <strong>${ingredient.name}</strong>
                    <span class="measure">${ingredient.measure}</span>
                </div>`;
            } else {
                return `<div class="ingredient-item">
                    <strong>${ingredient.name}</strong>
                </div>`;
            }
        }).join('');
        
        elements.ingredientsList.innerHTML = ingredientsHTML;
    }

    static createRecipeCard(meal) {
        const card = document.createElement("div");
        card.className = "recipe-card";
        card.innerHTML = `
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}" />
            <div class="recipe-card-content">
                <h3>${meal.strMeal}</h3>
                <p class="category">${meal.strCategory || 'Category not available'}</p>
                <p>${meal.strArea || 'Cuisine not available'}</p>
            </div>
        `;
        
        card.addEventListener("click", () => {
            RecipeSearchManager.showMealDetails(meal.idMeal);
        });
        
        return card;
    }

    static showMultipleResults(meals) {
        console.log("Showing results:", meals);
        
        if (!meals || meals.length === 0) {
            DOMElements.elements.resultsGrid.innerHTML = '<div class="no-results">No recipes found with those filters</div>';
            return;
        }
        
        try {
            allMeals = meals;
            currentPage = 1;
            
            if (meals[0]) {
                this.showMealInfo(meals[0]);
            }
            
            this.displayPaginatedResults();
        } catch (error) {
            console.error("Error showing results:", error);
            DOMElements.elements.resultsGrid.innerHTML = `<div class="no-results">Error showing results: ${error.message}</div>`;
        }
    }

    static displayPaginatedResults() {
        const startIndex = (currentPage - 1) * CONFIG.ITEMS_PER_PAGE;
        const endIndex = startIndex + CONFIG.ITEMS_PER_PAGE;
        const currentMeals = allMeals.slice(startIndex, endIndex);
        
        DOMElements.elements.resultsGrid.innerHTML = "";
        
        currentMeals.forEach(meal => {
            const card = this.createRecipeCard(meal);
            DOMElements.elements.resultsGrid.appendChild(card);
        });
        
        this.displayPagination();
    }

    static displayPagination() {
        const totalPages = Math.ceil(allMeals.length / CONFIG.ITEMS_PER_PAGE);
        
        if (totalPages <= 1) return;
        
        let paginationContainer = document.querySelector('.pagination-container');
        if (!paginationContainer) {
            paginationContainer = document.createElement('div');
            paginationContainer.className = 'pagination-container';
            DOMElements.elements.resultsGrid.parentNode.appendChild(paginationContainer);
        }
        
        let paginationHTML = '<div class="pagination">';
        
        // Previous button
        paginationHTML += `<button class="pagination-btn" onclick="NavigationManager.changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fa-solid fa-chevron-left"></i>
        </button>`;
        
        // Page numbers
        let startPage = Math.max(1, currentPage - Math.floor(CONFIG.MAX_VISIBLE_PAGES / 2));
        let endPage = Math.min(totalPages, startPage + CONFIG.MAX_VISIBLE_PAGES - 1);
        
        if (endPage - startPage + 1 < CONFIG.MAX_VISIBLE_PAGES) {
            startPage = Math.max(1, endPage - CONFIG.MAX_VISIBLE_PAGES + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="NavigationManager.changePage(${i})">${i}</button>`;
        }
        
        // Next button
        paginationHTML += `<button class="pagination-btn" onclick="NavigationManager.changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="fa-solid fa-chevron-right"></i>
        </button>`;
        
        // Page info
        const startItem = (currentPage - 1) * CONFIG.ITEMS_PER_PAGE + 1;
        const endItem = Math.min(currentPage * CONFIG.ITEMS_PER_PAGE, allMeals.length);
        paginationHTML += `<span class="pagination-info">Showing ${startItem}-${endItem} of ${allMeals.length} results</span>`;
        
        paginationHTML += '</div>';
        
        paginationContainer.innerHTML = paginationHTML;
    }

    static clearAllFilters() {
        DOMElements.elements.letterButtons.forEach(btn => btn.classList.remove('active'));
        DOMElements.elements.categoryFilter.value = "";
        DOMElements.elements.areaFilter.value = "";
        DOMElements.elements.input.value = "";
        DOMElements.elements.resultsGrid.innerHTML = "";
        
        DOMElements.elements.title.textContent = "Discover Your Perfect Recipe";
        DOMElements.elements.preparationInfo.textContent = "";
        DOMElements.elements.img.style.backgroundImage = "url(https://images.immediate.co.uk/production/volatile/sites/30/2020/08/chorizo-mozarella-gnocchi-bake-cropped-9ab73a3.jpg?quality=90&resize=556,505)";
        DOMElements.elements.ingredientsList.innerHTML = "";
        
        console.log("Filters cleared");
    }
}

// Filter Manager
class FilterManager {
    static async loadFilterOptions() {
        try {
            // Cargar categorías
            const categoriesResponse = await APIService.getCategories();
            const categoriesData = categoriesResponse.categories;
            
            if (categoriesData) {
                categoriesData.forEach(category => {
                    const option = document.createElement("option");
                    option.value = category.strCategory;
                    option.textContent = category.strCategory;
                    DOMElements.elements.categoryFilter.appendChild(option);
                });
            }

            // Cargar áreas
            const areasResponse = await APIService.getAreas();
            const areasData = areasResponse.meals;
            
            if (areasData) {
                areasData.forEach(area => {
                    const option = document.createElement("option");
                    option.value = area.strArea;
                    option.textContent = area.strArea;
                    DOMElements.elements.areaFilter.appendChild(option);
                });
            }

            console.log("Filtros cargados correctamente");
        } catch (error) {
            console.error("Error cargando filtros:", error);
        }
    }

    static async loadPopularCategories() {
        try {
            const categoriesGrid = document.getElementById("categoriesGrid");
            if (!categoriesGrid) return;

            // Categorías populares predefinidas con información adicional
            const popularCategories = [
                { name: "Beef", icon: "fa-solid fa-drumstick-bite", color: "#8B4513" },
                { name: "Chicken", icon: "fa-solid fa-drumstick-bite", color: "#DEB887" },
                { name: "Dessert", icon: "fa-solid fa-ice-cream", color: "#FF69B4" },
                { name: "Pasta", icon: "fa-solid fa-utensils", color: "#F4A460" },
                { name: "Seafood", icon: "fa-solid fa-fish", color: "#4682B4" },
                { name: "Vegetarian", icon: "fa-solid fa-seedling", color: "#90EE90" }
            ];

            // Limpiar el grid
            categoriesGrid.innerHTML = "";

            // Crear cards para cada categoría
            for (const category of popularCategories) {
                try {
                    // Obtener una receta aleatoria de la categoría
                    const response = await APIService.searchByCategory(category.name);
                    const data = response.meals;
                    
                    let imageUrl = "https://images.immediate.co.uk/production/volatile/sites/30/2020/08/chorizo-mozarella-gnocchi-bake-cropped-9ab73a3.jpg?quality=90&resize=556,505";
                    let recipeCount = 0;
                    
                    if (data && data.length > 0) {
                        // Tomar una receta aleatoria de la categoría
                        const randomIndex = Math.floor(Math.random() * Math.min(data.length, 10));
                        const randomMeal = data[randomIndex];
                        imageUrl = randomMeal.strMealThumb;
                        recipeCount = data.length;
                    }

                    // Crear la card de categoría
                    const categoryCard = document.createElement("div");
                    categoryCard.className = "category-card";
                    categoryCard.innerHTML = `
                        <div class="category-image" style="background-image: url('${imageUrl}')"></div>
                        <div class="category-info">
                            <i class="${category.icon}" style="color: ${category.color}"></i>
                            <h3 class="category-name">${category.name}</h3>
                            <p class="category-count">${recipeCount} recipes</p>
                        </div>
                    `;

                    // Agregar evento click para buscar por categoría
                    categoryCard.addEventListener("click", () => {
                        // Limpiar otros filtros
                        DOMElements.elements.letterButtons.forEach(btn => btn.classList.remove('active'));
                        DOMElements.elements.categoryFilter.value = category.name;
                        DOMElements.elements.areaFilter.value = "";
                        DOMElements.elements.input.value = "";
                        
                        // Buscar por categoría
                        FilterManager.searchByCategory(category.name);
                        
                        // Scroll hacia los resultados
                        document.querySelector('.results-section').scrollIntoView({ 
                            behavior: 'smooth' 
                        });
                    });

                    categoriesGrid.appendChild(categoryCard);

                } catch (error) {
                    console.warn(`Error cargando categoría ${category.name}:`, error);
                    
                    // Crear card con imagen por defecto
                    const categoryCard = document.createElement("div");
                    categoryCard.className = "category-card";
                    categoryCard.innerHTML = `
                        <div class="category-image" style="background-image: url('https://images.immediate.co.uk/production/volatile/sites/30/2020/08/chorizo-mozarella-gnocchi-bake-cropped-9ab73a3.jpg?quality=90&resize=556,505')"></div>
                        <div class="category-info">
                            <i class="${category.icon}" style="color: ${category.color}"></i>
                            <h3 class="category-name">${category.name}</h3>
                            <p class="category-count">0 recipes</p>
                        </div>
                    `;

                    categoryCard.addEventListener("click", () => {
                        DOMElements.elements.letterButtons.forEach(btn => btn.classList.remove('active'));
                        DOMElements.elements.categoryFilter.value = category.name;
                        DOMElements.elements.areaFilter.value = "";
                        DOMElements.elements.input.value = "";
                        FilterManager.searchByCategory(category.name);
                        document.querySelector('.results-section').scrollIntoView({ 
                            behavior: 'smooth' 
                        });
                    });

                    categoriesGrid.appendChild(categoryCard);
                }
            }

            console.log("Categorías populares cargadas correctamente");
        } catch (error) {
            console.error("Error cargando categorías populares:", error);
        }
    }

    static async searchByCategory(category) {
        if (!category) return;
        
        try {
            console.log("Buscando por categoría:", category);
            
            // Mostrar loading
            DOMElements.elements.resultsGrid.innerHTML = '<div class="loading">Buscando recetas por categoría...</div>';
            
            const data = await APIService.searchByCategory(category);
            console.log("Resultados por categoría:", data);
            
            if (data.meals && data.meals.length > 0) {
                console.log(`Encontradas ${data.meals.length} recetas para la categoría: ${category}`);
                // Obtener detalles completos de las recetas
                const detailedMeals = await RecipeDataManager.getDetailedMeals(data.meals);
                console.log("Recetas con detalles completos:", detailedMeals);
                FilterManager.showMultipleResults(detailedMeals);
            } else {
                console.log(`No se encontraron recetas para la categoría: ${category}`);
                FilterManager.showMultipleResults([]);
            }
            
        } catch (error) {
            console.error("Error buscando por categoría:", error);
            DOMElements.elements.resultsGrid.innerHTML = `<div class="no-results">Error al buscar por categoría: ${error.message}</div>`;
        }
    }

    static async searchByArea(area) {
        if (!area) return;
        
        try {
            console.log("Buscando por área:", area);
            
            const response = await APIService.searchByArea(area);
            console.log("Resultados por área:", response);
            
            if (response.meals) {
                // Obtener detalles completos de las recetas
                const detailedMeals = await RecipeDataManager.getDetailedMeals(response.meals);
                FilterManager.showMultipleResults(detailedMeals);
            } else {
                FilterManager.showMultipleResults([]);
            }
            
        } catch (error) {
            console.error("Error buscando por área:", error);
            DOMElements.elements.resultsGrid.innerHTML = '<div class="no-results">Error al buscar por área</div>';
        }
    }

    static async searchByLetter(letter) {
        try {
            console.log("Buscando por letra:", letter);
            
            const data = await APIService.searchByLetter(letter);
            console.log("Resultados por letra:", data);
            
            if (data.meals) {
                FilterManager.showMultipleResults(data.meals);
            } else {
                FilterManager.showMultipleResults([]);
            }
            
        } catch (error) {
            console.error("Error buscando por letra:", error);
            DOMElements.elements.resultsGrid.innerHTML = '<div class="no-results">Error al buscar por letra</div>';
        }
    }

    static async searchByMultipleIngredients(ingredients) {
        const ingredientList = ingredients.split(',').map(ing => ing.trim().toLowerCase());
        console.log("Buscando ingredientes:", ingredientList);
        
        try {
            // Intentar primero con API premium (multi-ingrediente)
            let data = null;
            let usedPremium = false;
            
            try {
                console.log("Intentando con API premium...");
                const ingredientsParam = ingredientList.join(',');
                const response = await APIService.searchByIngredients(ingredientsParam);
                
                if (response.ok) {
                    data = response.meals;
                    usedPremium = true;
                    console.log("API premium exitosa:", data);
                } else {
                    throw new Error(`Premium API failed: ${response.status}`);
                }
            } catch (premiumError) {
                console.log("API premium falló, usando método alternativo:", premiumError.message);
                usedPremium = false;
                
                // Método alternativo: buscar por primer ingrediente y filtrar manualmente
                const firstIngredient = ingredientList[0];
                console.log("Buscando por primer ingrediente:", firstIngredient);
                
                const response = await APIService.searchByIngredients(firstIngredient);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                data = response.meals;
                console.log("Respuesta de API pública:", data);
            }
            
            if (!data) {
                FilterManager.showMultipleResults([]);
                return;
            }
            
            // Obtener detalles completos de las recetas
            const detailedMeals = [];
            
            for (const meal of data) {
                try {
                    // Obtener detalles completos de la receta
                    const mealDetailsResponse = await APIService.getMealDetails(meal.idMeal);
                    
                    if (!mealDetailsResponse.ok) {
                        console.warn(`Error al obtener detalles de receta ${meal.idMeal}`);
                        continue;
                    }
                    
                    const mealDetails = await mealDetailsResponse.json();
                    
                    if (mealDetails.meals && mealDetails.meals[0]) {
                        const mealData = mealDetails.meals[0];
                        
                        // Si no usamos API premium, filtrar manualmente por ingredientes
                        if (!usedPremium) {
                            const mealIngredients = [];
                            
                            // Extraer ingredientes de la receta
                            for (let i = 1; i <= 20; i++) {
                                if (mealData[`strIngredient${i}`]) {
                                    mealIngredients.push(mealData[`strIngredient${i}`].toLowerCase());
                                }
                            }
                            
                            // Verificar si la receta contiene todos los ingredientes buscados
                            const containsAllIngredients = ingredientList.every(ingredient => 
                                mealIngredients.some(mealIngredient => 
                                    mealIngredient.includes(ingredient) || ingredient.includes(mealIngredient)
                                )
                            );
                            
                            if (containsAllIngredients) {
                                detailedMeals.push(mealData);
                            }
                        } else {
                            // Si usamos API premium, agregar directamente
                            detailedMeals.push(mealData);
                        }
                    }
                } catch (error) {
                    console.warn(`Error al procesar receta ${meal.idMeal}:`, error);
                    continue;
                }
            }
            
            console.log("Recetas con detalles completos:", detailedMeals);
            FilterManager.showMultipleResults(detailedMeals);
            
        } catch (error) {
            console.error("Error searching by ingredients:", error);
            DOMElements.elements.resultsGrid.innerHTML = '<div class="no-results">Error al buscar recetas: ' + error.message + '</div>';
        }
    }

    static async searchMeal(e) {
        e.preventDefault();
        console.log("Iniciando búsqueda...");
        
        const val = DOMElements.elements.input.value.trim();
        console.log("Valor de búsqueda:", val);
        
        if (!val) {
            alert("Por favor ingresa ingredientes para buscar");
            return;
        }
        
        // Mostrar loading
        DOMElements.elements.resultsGrid.innerHTML = '<div class="loading">Buscando recetas...</div>';
        
        // Buscar por múltiples ingredientes
        await FilterManager.searchByMultipleIngredients(val);
    }

    static async clearAllFilters() {
        // Limpiar botones de letra
        DOMElements.elements.letterButtons.forEach(btn => btn.classList.remove('active'));
        
        // Limpiar dropdowns
        DOMElements.elements.categoryFilter.value = "";
        DOMElements.elements.areaFilter.value = "";
        
        // Limpiar input de búsqueda
        DOMElements.elements.input.value = "";
        
        // Limpiar resultados
        DOMElements.elements.resultsGrid.innerHTML = "";
        
        // Restaurar estado inicial
        DOMElements.elements.title.textContent = "Discover Your Perfect Recipe";
        DOMElements.elements.preparationInfo.textContent = "";
        DOMElements.elements.img.style.backgroundImage = "url(https://images.immediate.co.uk/production/volatile/sites/30/2020/08/chorizo-mozarella-gnocchi-bake-cropped-9ab73a3.jpg?quality=90&resize=556,505)";
        DOMElements.elements.ingredientsList.innerHTML = "";
        
        console.log("Filtros limpiados");
    }

    static async displayPaginatedResults() {
        const startIndex = (currentPage - 1) * CONFIG.ITEMS_PER_PAGE;
        const endIndex = startIndex + CONFIG.ITEMS_PER_PAGE;
        const currentMeals = allMeals.slice(startIndex, endIndex);
        
        // Limpiar grid
        DOMElements.elements.resultsGrid.innerHTML = "";
        
        // Mostrar comidas de la página actual
        currentMeals.forEach(meal => {
            const card = RecipeCardCreator.createRecipeCard(meal);
            DOMElements.elements.resultsGrid.appendChild(card);
        });
        
        // Mostrar paginación
        FilterManager.displayPagination();
    }

    static async displayPagination() {
        const totalPages = Math.ceil(allMeals.length / CONFIG.ITEMS_PER_PAGE);
        
        if (totalPages <= 1) return;
        
        // Buscar o crear contenedor de paginación
        let paginationContainer = document.querySelector('.pagination-container');
        if (!paginationContainer) {
            paginationContainer = document.createElement('div');
            paginationContainer.className = 'pagination-container';
            DOMElements.elements.resultsGrid.parentNode.appendChild(paginationContainer);
        }
        
        let paginationHTML = '<div class="pagination">';
        
        // Botón anterior
        paginationHTML += `<button class="pagination-btn" onclick="FilterManager.changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fa-solid fa-chevron-left"></i>
        </button>`;
        
        // Números de página
        const maxVisiblePages = CONFIG.MAX_VISIBLE_PAGES;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="FilterManager.changePage(${i})">${i}</button>`;
        }
        
        // Botón siguiente
        paginationHTML += `<button class="pagination-btn" onclick="FilterManager.changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="fa-solid fa-chevron-right"></i>
        </button>`;
        
        // Información de página
        const startItem = (currentPage - 1) * CONFIG.ITEMS_PER_PAGE + 1;
        const endItem = Math.min(currentPage * CONFIG.ITEMS_PER_PAGE, allMeals.length);
        paginationHTML += `<span class="pagination-info">Mostrando ${startItem}-${endItem} de ${allMeals.length} resultados</span>`;
        
        paginationHTML += '</div>';
        
        paginationContainer.innerHTML = paginationHTML;
    }

    static async changePage(page) {
        const totalPages = Math.ceil(allMeals.length / CONFIG.ITEMS_PER_PAGE);
        if (page >= 1 && page <= totalPages) {
            currentPage = page;
            await FilterManager.displayPaginatedResults();
            
            // Scroll hacia los resultados
            document.querySelector('.results-section').scrollIntoView({ 
                behavior: 'smooth' 
            });
        }
    }

    static async searchByLetter(letter) {
        try {
            console.log("Buscando por letra:", letter);
            
            const data = await APIService.searchByLetter(letter);
            console.log("Resultados por letra:", data);
            
            if (data.meals) {
                FilterManager.showMultipleResults(data.meals);
            } else {
                FilterManager.showMultipleResults([]);
            }
            
        } catch (error) {
            console.error("Error buscando por letra:", error);
            DOMElements.elements.resultsGrid.innerHTML = '<div class="no-results">Error al buscar por letra</div>';
        }
    }

    static async showMultipleResults(meals) {
        console.log("Mostrando resultados:", meals);
        
        if (!meals || meals.length === 0) {
            DOMElements.elements.resultsGrid.innerHTML = '<div class="no-results">No se encontraron recetas con esos filtros</div>';
            return;
        }
        
        try {
            // Guardar todas las comidas para paginación
            allMeals = meals;
            currentPage = 1;
            
            // Mostrar la primera receta en la card principal
            if (meals[0]) {
                FilterManager.showMealInfo(meals[0]);
            }
            
            // Mostrar resultados paginados
            await FilterManager.displayPaginatedResults();
        } catch (error) {
            console.error("Error mostrando resultados:", error);
            DOMElements.elements.resultsGrid.innerHTML = `<div class="no-results">Error al mostrar resultados: ${error.message}</div>`;
        }
    }

    static async showMealInfo(meal) {
        const { strMeal, strMealThumb, strInstructions } = meal;
        DOMElements.elements.title.textContent = strMeal;
        DOMElements.elements.img.style.backgroundImage = `url(${strMealThumb})`;
        
        // Procesar instrucciones con bullet points
        const instructions = RecipeDataManager.processInstructions(strInstructions);
        const instructionsHTML = instructions.map(instruction => 
            `<li>${instruction.trim()}</li>`
        ).join('');
        
        DOMElements.elements.preparationInfo.innerHTML = `<ol class="instructions-list">${instructionsHTML}</ol>`;

        const ingredients = RecipeDataManager.processIngredients(meal);
        const html = ingredients.map(ingredient => 
            `<div class="ingredient-item">
                <strong>${ingredient.name}</strong>
                <span class="measure">${ingredient.measure}</span>
            </div>`
        ).join("");
        DOMElements.elements.ingredientsList.innerHTML = html;
    }
}

// Search Manager - Single Responsibility Principle
class SearchManager {
    static async searchByCategory(category) {
        if (!category) return;
        
        try {
            console.log("Searching by category:", category);
            DOMElements.elements.resultsGrid.innerHTML = '<div class="loading">Searching recipes by category...</div>';
            
            const data = await APIService.searchByCategory(category);
            console.log("Category results:", data);
            
            if (data.meals && data.meals.length > 0) {
                console.log(`Found ${data.meals.length} recipes for category: ${category}`);
                const detailedMeals = await RecipeDataManager.getDetailedMeals(data.meals);
                console.log("Recipes with complete details:", detailedMeals);
                UIManager.showMultipleResults(detailedMeals);
            } else {
                console.log(`No recipes found for category: ${category}`);
                UIManager.showMultipleResults([]);
            }
            
        } catch (error) {
            console.error("Error searching by category:", error);
            DOMElements.elements.resultsGrid.innerHTML = `<div class="no-results">Error searching by category: ${error.message}</div>`;
        }
    }

    static async searchByArea(area) {
        if (!area) return;
        
        try {
            console.log("Searching by area:", area);
            DOMElements.elements.resultsGrid.innerHTML = '<div class="loading">Searching recipes by cuisine...</div>';
            
            const data = await APIService.searchByArea(area);
            console.log("Area results:", data);
            
            if (data.meals && data.meals.length > 0) {
                console.log(`Found ${data.meals.length} recipes for area: ${area}`);
                const detailedMeals = await RecipeDataManager.getDetailedMeals(data.meals);
                UIManager.showMultipleResults(detailedMeals);
            } else {
                console.log(`No recipes found for area: ${area}`);
                UIManager.showMultipleResults([]);
            }
            
        } catch (error) {
            console.error("Error searching by area:", error);
            DOMElements.elements.resultsGrid.innerHTML = `<div class="no-results">Error searching by cuisine: ${error.message}</div>`;
        }
    }

    static async searchByLetter(letter) {
        try {
            console.log("Searching by letter:", letter);
            DOMElements.elements.resultsGrid.innerHTML = '<div class="loading">Searching recipes...</div>';
            
            const data = await APIService.searchByLetter(letter);
            console.log("Letter results:", data);
            
            if (data.meals) {
                UIManager.showMultipleResults(data.meals);
            } else {
                UIManager.showMultipleResults([]);
            }
            
        } catch (error) {
            console.error("Error searching by letter:", error);
            DOMElements.elements.resultsGrid.innerHTML = '<div class="no-results">Error searching by letter</div>';
        }
    }

    static async searchByIngredients(ingredients) {
        const ingredientList = ingredients.split(',').map(ing => ing.trim().toLowerCase());
        console.log("Searching ingredients:", ingredientList);
        
        try {
            DOMElements.elements.resultsGrid.innerHTML = '<div class="loading">Searching recipes...</div>';
            
            let data = null;
            let usedPremium = false;
            
            try {
                console.log("Trying premium API...");
                const ingredientsParam = ingredientList.join(',');
                data = await APIService.searchByIngredients(ingredientsParam);
                usedPremium = true;
                console.log("Premium API successful:", data);
            } catch (premiumError) {
                console.log("Premium API failed, using alternative method:", premiumError.message);
                usedPremium = false;
                
                const firstIngredient = ingredientList[0];
                console.log("Searching by first ingredient:", firstIngredient);
                data = await APIService.searchByIngredients(firstIngredient);
                console.log("Public API response:", data);
            }
            
            if (!data.meals) {
                UIManager.showMultipleResults([]);
                return;
            }
            
            const detailedMeals = [];
            
            for (const meal of data.meals) {
                try {
                    const mealDetails = await APIService.getMealDetails(meal.idMeal);
                    
                    if (mealDetails.meals && mealDetails.meals[0]) {
                        const mealData = mealDetails.meals[0];
                        
                        if (!usedPremium) {
                            const mealIngredients = [];
                            
                            for (let i = 1; i <= 20; i++) {
                                if (mealData[`strIngredient${i}`]) {
                                    mealIngredients.push(mealData[`strIngredient${i}`].toLowerCase());
                                }
                            }
                            
                            const containsAllIngredients = ingredientList.every(ingredient => 
                                mealIngredients.some(mealIngredient => 
                                    mealIngredient.includes(ingredient) || ingredient.includes(mealIngredient)
                                )
                            );
                            
                            if (containsAllIngredients) {
                                detailedMeals.push(mealData);
                            }
                        } else {
                            detailedMeals.push(mealData);
                        }
                    }
                } catch (error) {
                    console.warn(`Error processing recipe ${meal.idMeal}:`, error);
                    continue;
                }
            }
            
            console.log("Recipes with complete details:", detailedMeals);
            UIManager.showMultipleResults(detailedMeals);
            
        } catch (error) {
            console.error("Error searching by ingredients:", error);
            DOMElements.elements.resultsGrid.innerHTML = `<div class="no-results">Error searching recipes: ${error.message}</div>`;
        }
    }

    static async searchMeal(e) {
        e.preventDefault();
        console.log("Starting search...");
        
        const val = DOMElements.elements.input.value.trim();
        console.log("Search value:", val);
        
        if (!val) {
            alert("Please enter ingredients to search");
            return;
        }
        
        await this.searchByIngredients(val);
    }
}

// Navigation Manager - Single Responsibility Principle
class NavigationManager {
    static changePage(page) {
        const totalPages = Math.ceil(allMeals.length / CONFIG.ITEMS_PER_PAGE);
        if (page >= 1 && page <= totalPages) {
            currentPage = page;
            UIManager.displayPaginatedResults();
            
            document.querySelector('.results-section').scrollIntoView({ 
                behavior: 'smooth' 
            });
        }
    }

    static navigateToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
            this.updateActiveNavLink(sectionId);
        }
    }

    static updateActiveNavLink(sectionId) {
        DOMElements.elements.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.section === sectionId) {
                link.classList.add('active');
            }
        });
    }

    static initializeNavigation() {
        DOMElements.elements.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = link.dataset.section;
                this.navigateToSection(sectionId);
            });
        });
    }
}

// Category Manager - Single Responsibility Principle
class CategoryManager {
    static async loadPopularCategories() {
        try {
            const categoriesGrid = document.getElementById("categoriesGrid");
            if (!categoriesGrid) return;

            const popularCategories = [
                { name: "Beef", icon: "fa-solid fa-drumstick-bite", color: "#8B4513" },
                { name: "Chicken", icon: "fa-solid fa-drumstick-bite", color: "#DEB887" },
                { name: "Dessert", icon: "fa-solid fa-ice-cream", color: "#FF69B4" },
                { name: "Pasta", icon: "fa-solid fa-utensils", color: "#F4A460" },
                { name: "Seafood", icon: "fa-solid fa-fish", color: "#4682B4" },
                { name: "Vegetarian", icon: "fa-solid fa-seedling", color: "#90EE90" }
            ];

            categoriesGrid.innerHTML = "";

            for (const category of popularCategories) {
                try {
                    const data = await APIService.searchByCategory(category.name);
                    
                    let imageUrl = "https://images.immediate.co.uk/production/volatile/sites/30/2020/08/chorizo-mozarella-gnocchi-bake-cropped-9ab73a3.jpg?quality=90&resize=556,505";
                    let recipeCount = 0;
                    
                    if (data.meals && data.meals.length > 0) {
                        const randomIndex = Math.floor(Math.random() * Math.min(data.meals.length, 10));
                        const randomMeal = data.meals[randomIndex];
                        imageUrl = randomMeal.strMealThumb;
                        recipeCount = data.meals.length;
                    }

                    const categoryCard = this.createCategoryCard(category, imageUrl, recipeCount);
                    categoriesGrid.appendChild(categoryCard);

                } catch (error) {
                    console.warn(`Error loading category ${category.name}:`, error);
                    const categoryCard = this.createCategoryCard(category, imageUrl, 0);
                    categoriesGrid.appendChild(categoryCard);
                }
            }

            console.log("Popular categories loaded successfully");
        } catch (error) {
            console.error("Error loading popular categories:", error);
        }
    }

    static createCategoryCard(category, imageUrl, recipeCount) {
        const categoryCard = document.createElement("div");
        categoryCard.className = "category-card";
        categoryCard.innerHTML = `
            <div class="category-image" style="background-image: url('${imageUrl}')"></div>
            <div class="category-info">
                <i class="${category.icon}" style="color: ${category.color}"></i>
                <h3 class="category-name">${category.name}</h3>
                <p class="category-count">${recipeCount} recipes</p>
            </div>
        `;

        categoryCard.addEventListener("click", () => {
            DOMElements.elements.letterButtons.forEach(btn => btn.classList.remove('active'));
            DOMElements.elements.categoryFilter.value = category.name;
            DOMElements.elements.areaFilter.value = "";
            DOMElements.elements.input.value = "";
            
            SearchManager.searchByCategory(category.name);
            
            NavigationManager.navigateToSection('recipes');
        });

        return categoryCard;
    }

    static async loadFilterOptions() {
        try {
            const categoriesData = await APIService.getCategories();
            
            if (categoriesData.categories) {
                categoriesData.categories.forEach(category => {
                    const option = document.createElement("option");
                    option.value = category.strCategory;
                    option.textContent = category.strCategory;
                    DOMElements.elements.categoryFilter.appendChild(option);
                });
            }

            const areasData = await APIService.getAreas();
            
            if (areasData.meals) {
                areasData.meals.forEach(area => {
                    const option = document.createElement("option");
                    option.value = area.strArea;
                    option.textContent = area.strArea;
                    DOMElements.elements.areaFilter.appendChild(option);
                });
            }

            console.log("Filters loaded successfully");
        } catch (error) {
            console.error("Error loading filters:", error);
        }
    }
}

// Event Listeners
class EventListeners {
    static initialize() {
        const form = document.querySelector(".search-form");
        if (form) {
            form.addEventListener("submit", FilterManager.searchMeal);
            console.log("Event listener de formulario agregado");
        }

        const searchBtn = document.querySelector(".search-btn");
        if (searchBtn) {
            searchBtn.addEventListener("click", FilterManager.searchMeal);
            console.log("Event listener de botón de búsqueda agregado");
        }

        // Event listeners para filtros
        DOMElements.elements.letterButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                // Remover clase active de todos los botones
                DOMElements.elements.letterButtons.forEach(b => b.classList.remove('active'));
                // Agregar clase active al botón clickeado
                btn.classList.add('active');
                
                const letter = btn.dataset.letter;
                FilterManager.searchByLetter(letter);
            });
        });

        DOMElements.elements.categoryFilter.addEventListener("change", (e) => {
            const category = e.target.value;
            if (category) {
                FilterManager.searchByCategory(category);
            }
        });

        DOMElements.elements.areaFilter.addEventListener("change", (e) => {
            const area = e.target.value;
            if (area) {
                FilterManager.searchByArea(area);
            }
        });

        // Event listeners para botones de búsqueda
        if (DOMElements.elements.searchFiltersBtn) {
            DOMElements.elements.searchFiltersBtn.addEventListener("click", async () => {
                const category = DOMElements.elements.categoryFilter.value;
                const area = DOMElements.elements.areaFilter.value;
                const ingredients = DOMElements.elements.input.value.trim();

                console.log("Búsqueda de filtros iniciada:", { category, area, ingredients });

                if (!category && !area && !ingredients) {
                    alert("Por favor selecciona al menos un filtro para buscar");
                    return;
                }

                try {
                    // Limpiar otros filtros
                    DOMElements.elements.letterButtons.forEach(btn => btn.classList.remove('active'));
                    
                    // Aplicar filtros
                    if (category) {
                        console.log("Buscando por categoría:", category);
                        await FilterManager.searchByCategory(category);
                    } else if (area) {
                        console.log("Buscando por área:", area);
                        await FilterManager.searchByArea(area);
                    } else if (ingredients) {
                        console.log("Buscando por ingredientes:", ingredients);
                        await FilterManager.searchByMultipleIngredients(ingredients);
                    }
                    
                    // Scroll hacia los resultados
                    document.querySelector('.results-section').scrollIntoView({ 
                        behavior: 'smooth' 
                    });
                } catch (error) {
                    console.error("Error en la búsqueda de filtros:", error);
                    DOMElements.elements.resultsGrid.innerHTML = `<div class="no-results">Error en la búsqueda: ${error.message}</div>`;
                }
            });
        }

        if (DOMElements.elements.clearFiltersBtn) {
            DOMElements.elements.clearFiltersBtn.addEventListener("click", FilterManager.clearAllFilters);
            console.log("Event listener de limpiar filtros agregado");
        }
    }
}

// Main Application Initialization
class App {
    static async initialize() {
        try {
            console.log("Initializing Gourmetia application...");
            
            // Initialize DOM elements
            DOMElements.initialize();
            
            // Initialize navigation
            NavigationManager.initializeNavigation();
            
            // Load filter options
            await CategoryManager.loadFilterOptions();
            
            // Load popular categories
            await CategoryManager.loadPopularCategories();
            
            // Initialize event listeners
            this.initializeEventListeners();
            
            console.log("Application initialized successfully");
            
        } catch (error) {
            console.error("Error initializing application:", error);
        }
    }

    static initializeEventListeners() {
        // Search form
        const form = document.querySelector(".search-form");
        if (form) {
            form.addEventListener("submit", (e) => SearchManager.searchMeal(e));
            console.log("Search form event listener added");
        }

        // Search button
        const searchBtn = document.querySelector(".search-btn");
        if (searchBtn) {
            searchBtn.addEventListener("click", (e) => SearchManager.searchMeal(e));
            console.log("Search button event listener added");
        }

        // Letter buttons
        DOMElements.elements.letterButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                DOMElements.elements.letterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const letter = btn.dataset.letter;
                SearchManager.searchByLetter(letter);
            });
        });

        // Category filter
        DOMElements.elements.categoryFilter.addEventListener("change", (e) => {
            const category = e.target.value;
            if (category) {
                SearchManager.searchByCategory(category);
            }
        });

        // Area filter
        DOMElements.elements.areaFilter.addEventListener("change", (e) => {
            const area = e.target.value;
            if (area) {
                SearchManager.searchByArea(area);
            }
        });

        // Search filters button
        if (DOMElements.elements.searchFiltersBtn) {
            DOMElements.elements.searchFiltersBtn.addEventListener("click", async () => {
                const category = DOMElements.elements.categoryFilter.value;
                const area = DOMElements.elements.areaFilter.value;
                const ingredients = DOMElements.elements.input.value.trim();

                console.log("Filter search started:", { category, area, ingredients });

                if (!category && !area && !ingredients) {
                    alert("Please select at least one filter to search");
                    return;
                }

                try {
                    DOMElements.elements.letterButtons.forEach(btn => btn.classList.remove('active'));
                    
                    if (category) {
                        console.log("Searching by category:", category);
                        await SearchManager.searchByCategory(category);
                    } else if (area) {
                        console.log("Searching by area:", area);
                        await SearchManager.searchByArea(area);
                    } else if (ingredients) {
                        console.log("Searching by ingredients:", ingredients);
                        await SearchManager.searchByIngredients(ingredients);
                    }
                    
                    NavigationManager.navigateToSection('recipes');
                } catch (error) {
                    console.error("Error in filter search:", error);
                    DOMElements.elements.resultsGrid.innerHTML = `<div class="no-results">Search error: ${error.message}</div>`;
                }
            });
        }

        // Clear filters button
        if (DOMElements.elements.clearFiltersBtn) {
            DOMElements.elements.clearFiltersBtn.addEventListener("click", () => {
                UIManager.clearAllFilters();
                console.log("Clear filters event listener added");
            });
        }
    }
}

// Global function for pagination (needed for onclick attributes)
window.NavigationManager = NavigationManager;

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    App.initialize();
});
