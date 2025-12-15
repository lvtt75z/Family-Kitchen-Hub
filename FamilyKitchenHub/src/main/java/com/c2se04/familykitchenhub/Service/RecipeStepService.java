package com.c2se04.familykitchenhub.Service;

import com.c2se04.familykitchenhub.Exception.ResourceNotFoundException;
import com.c2se04.familykitchenhub.model.Recipe;
import com.c2se04.familykitchenhub.model.RecipeStep;
import com.c2se04.familykitchenhub.Repository.RecipeRepository;
import com.c2se04.familykitchenhub.Repository.RecipeStepRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RecipeStepService {

    @Autowired
    private RecipeStepRepository recipeStepRepository;

    @Autowired
    private RecipeRepository recipeRepository;

    public List<RecipeStep> getStepsByRecipeId(Long recipeId) {
        return recipeStepRepository.findByRecipeIdOrderByStepOrderAsc(recipeId);
    }

    @Transactional
    public RecipeStep createStep(Long recipeId, RecipeStep step) {
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe not found with id: " + recipeId));

        step.setRecipe(recipe);
        return recipeStepRepository.save(step);
    }

    @Transactional
    public RecipeStep updateStep(Long stepId, RecipeStep stepDetails) {
        RecipeStep step = recipeStepRepository.findById(stepId)
                .orElseThrow(() -> new ResourceNotFoundException("Step not found with id: " + stepId));

        if (stepDetails.getStepOrder() != null) {
            step.setStepOrder(stepDetails.getStepOrder());
        }
        if (stepDetails.getDescription() != null) {
            step.setDescription(stepDetails.getDescription());
        }
        if (stepDetails.getMediaUrl() != null) {
            step.setMediaUrl(stepDetails.getMediaUrl());
        }

        return recipeStepRepository.save(step);
    }

    @Transactional
    public void deleteStep(Long stepId) {
        RecipeStep step = recipeStepRepository.findById(stepId)
                .orElseThrow(() -> new ResourceNotFoundException("Step not found with id: " + stepId));
        recipeStepRepository.delete(step);
    }
}
