package com.c2se04.familykitchenhub.enums;

/**
 * Recipe status for admin approval workflow
 */
public enum RecipeStatus {
    /**
     * Recipe created by admin or system - always visible, no approval needed
     */
    ADMIN_CREATED,

    /**
     * User is still editing their recipe - not submitted yet
     */
    DRAFT,

    /**
     * User submitted recipe, waiting for admin review
     */
    PENDING_APPROVAL,

    /**
     * Admin approved recipe - visible to all users
     */
    APPROVED,

    /**
     * Admin rejected recipe - not visible to public
     */
    REJECTED
}
