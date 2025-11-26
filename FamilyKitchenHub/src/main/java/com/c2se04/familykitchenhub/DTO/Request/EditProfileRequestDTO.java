package com.c2se04.familykitchenhub.DTO.Request;

public class EditProfileRequestDTO {
    private String fullName;
    private String gender; // male, female, other
    private String pathology; // allergy, diabetes, hypertension, none
    private String email;
    private Integer numberOfFamilyMembers;
    private String country; // vietnam, usa, uk, france
    private String favorite; // Vegetarian, Vegan, Meat Lover, Balanced
    private AgeGroupsDTO ageGroups;

    // Inner class for age groups
    public static class AgeGroupsDTO {
        private Boolean children = false;
        private Boolean teenagers = false;
        private Boolean adult = false;
        private Boolean oldPerson = false;

        public Boolean getChildren() {
            return children;
        }

        public void setChildren(Boolean children) {
            this.children = children;
        }

        public Boolean getTeenagers() {
            return teenagers;
        }

        public void setTeenagers(Boolean teenagers) {
            this.teenagers = teenagers;
        }

        public Boolean getAdult() {
            return adult;
        }

        public void setAdult(Boolean adult) {
            this.adult = adult;
        }

        public Boolean getOldPerson() {
            return oldPerson;
        }

        public void setOldPerson(Boolean oldPerson) {
            this.oldPerson = oldPerson;
        }
    }

    // Getters and Setters
    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getPathology() {
        return pathology;
    }

    public void setPathology(String pathology) {
        this.pathology = pathology;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Integer getNumberOfFamilyMembers() {
        return numberOfFamilyMembers;
    }

    public void setNumberOfFamilyMembers(Integer numberOfFamilyMembers) {
        this.numberOfFamilyMembers = numberOfFamilyMembers;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getFavorite() {
        return favorite;
    }

    public void setFavorite(String favorite) {
        this.favorite = favorite;
    }

    public AgeGroupsDTO getAgeGroups() {
        return ageGroups;
    }

    public void setAgeGroups(AgeGroupsDTO ageGroups) {
        this.ageGroups = ageGroups;
    }
}

