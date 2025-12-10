import axios from '../hooks/axios';

// Admin CRUD operations for recipes

// Get all recipes
export const getAllRecipes = async () => {
    const response = await axios.get('/recipes');
    return response.data;
};

// Get recipe by ID
export const getRecipeById = async (id) => {
    const response = await axios.get(`/recipes/${id}`);
    return response.data;
};

// Create new recipe
export const createRecipe = async (recipeData) => {
    const response = await axios.post('/recipes', recipeData);
    return response.data;
};

// Update recipe
export const updateRecipe = async (id, recipeData) => {
    const response = await axios.put(`/recipes/${id}`, recipeData);
    return response.data;
};

// Delete recipe
export const deleteRecipe = async (id) => {
    await axios.delete(`/recipes/${id}`);
};

// Get recipe categories
export const getRecipeCategories = async (recipeId) => {
    const response = await axios.get(`/recipes/${recipeId}/categories`);
    return response.data;
};

// Update recipe categories
export const setRecipeCategories = async (recipeId, categoryIds) => {
    const response = await axios.post(`/recipes/${recipeId}/categories`, { categoryIds });
    return response.data;
};

// Add category to recipe
export const addCategoryToRecipe = async (recipeId, categoryId) => {
    const response = await axios.post(`/recipes/${recipeId}/categories/${categoryId}`);
    return response.data;
};

// Remove category from recipe
export const removeCategoryFromRecipe = async (recipeId, categoryId) => {
    const response = await axios.delete(`/recipes/${recipeId}/categories/${categoryId}`);
    return response.data;
};

// Get recipe steps (from dedicated endpoint)
export const getRecipeSteps = async (recipeId) => {
    const response = await axios.get(`/recipes/${recipeId}/steps`);
    return response.data;
};

// Create recipe step
export const createRecipeStep = async (recipeId, stepData) => {
    const response = await axios.post(`/recipes/${recipeId}/steps`, stepData);
    return response.data;
};

// Update recipe step
export const updateRecipeStep = async (recipeId, stepId, stepData) => {
    const response = await axios.put(`/recipes/${recipeId}/steps/${stepId}`, stepData);
    return response.data;
};

// Delete recipe step
export const deleteRecipeStep = async (recipeId, stepId) => {
    await axios.delete(`/recipes/${recipeId}/steps/${stepId}`);
};

// Get recipe ingredients (from recipe detail)
export const getRecipeIngredients = async (recipeId) => {
    const response = await axios.get(`/recipes/${recipeId}/ingredients`);
    return response.data;
};

// Add ingredient to recipe
export const addRecipeIngredient = async (recipeId, ingredientData) => {
    const response = await axios.post(`/recipes/${recipeId}/ingredients`, ingredientData);
    return response.data;
};

// Update recipe ingredient
export const updateRecipeIngredient = async (recipeId, ingredientId, ingredientData) => {
    const response = await axios.put(`/recipes/${recipeId}/ingredients/${ingredientId}`, ingredientData);
    return response.data;
};

// Delete recipe ingredient
export const deleteRecipeIngredient = async (recipeId, ingredientId) => {
    await axios.delete(`/recipes/${recipeId}/ingredients/${ingredientId}`);
};

export default {
    getAllRecipes,
    getRecipeById,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    getRecipeCategories,
    setRecipeCategories,
    getRecipeSteps,
    createRecipeStep,
    updateRecipeStep,
    deleteRecipeStep,
    getRecipeIngredients,
    addRecipeIngredient,
    updateRecipeIngredient,
    deleteRecipeIngredient
};
