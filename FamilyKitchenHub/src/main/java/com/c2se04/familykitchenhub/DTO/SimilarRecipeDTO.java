package com.c2se04.familykitchenhub.DTO;

import java.util.List;

/**
 * DTO for Similar Recipe Recommendations (Feature 7.2)
 * Contains recipe info + similarity metrics
 */
public class SimilarRecipeDTO {
    private Long id;
    private String title;
    private String imageUrl;
    private Integer cookingTimeMinutes;
    private Integer servings;
    private Double similarityScore;
    private String similarityReason;
    private List<String> sharedCategories;
    private List<String> sharedIngredients;

    // Constructors
    public SimilarRecipeDTO() {}

    public SimilarRecipeDTO(Long id, String title, String imageUrl, 
                            Integer cookingTimeMinutes, Integer servings,
                            Double similarityScore, String similarityReason) {
        this.id = id;
        this.title = title;
        this.imageUrl = imageUrl;
        this.cookingTimeMinutes = cookingTimeMinutes;
        this.servings = servings;
        this.similarityScore = similarityScore;
        this.similarityReason = similarityReason;
    }

    // Getters and Setters
    public Long getId() { 
        return id; 
    }
    
    public void setId(Long id) { 
        this.id = id; 
    }

    public String getTitle() { 
        return title; 
    }
    
    public void setTitle(String title) { 
        this.title = title; 
    }

    public String getImageUrl() { 
        return imageUrl; 
    }
    
    public void setImageUrl(String imageUrl) { 
        this.imageUrl = imageUrl; 
    }

    public Integer getCookingTimeMinutes() { 
        return cookingTimeMinutes; 
    }
    
    public void setCookingTimeMinutes(Integer cookingTimeMinutes) { 
        this.cookingTimeMinutes = cookingTimeMinutes; 
    }

    public Integer getServings() { 
        return servings; 
    }
    
    public void setServings(Integer servings) { 
        this.servings = servings; 
    }

    public Double getSimilarityScore() { 
        return similarityScore; 
    }
    
    public void setSimilarityScore(Double similarityScore) { 
        this.similarityScore = similarityScore; 
    }

    public String getSimilarityReason() { 
        return similarityReason; 
    }
    
    public void setSimilarityReason(String similarityReason) { 
        this.similarityReason = similarityReason; 
    }

    public List<String> getSharedCategories() { 
        return sharedCategories; 
    }
    
    public void setSharedCategories(List<String> sharedCategories) { 
        this.sharedCategories = sharedCategories; 
    }

    public List<String> getSharedIngredients() { 
        return sharedIngredients; 
    }
    
    public void setSharedIngredients(List<String> sharedIngredients) { 
        this.sharedIngredients = sharedIngredients; 
    }
}




