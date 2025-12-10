
import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Checkbox,
    FormControlLabel,
    Avatar,
    Card,
    CardContent,
    Grid,
    CircularProgress,
    Alert,
    Snackbar
} from '@mui/material';
import { Edit, Email } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import '../styles/EditProfile.css';
import axios from "../hooks/axios";

const EditProfile = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        gender: '',
        pathology: '',
        numberOfFamilyMembers: 1,
        country: '',
        favorite: 'Vegetarian',
        ageGroups: {
            children: false,
            teenagers: false,
            adult: true,
            oldPerson: false
        }
    });

    // Load current profile from backend on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const userDataString = localStorage.getItem("user");
                const userData = userDataString ? JSON.parse(userDataString) : null;
                let userId = userData?.user?.id || userData?.id || localStorage.getItem("userId");
                
                // Convert to number if it's a string
                if (userId) {
                    userId = Number(userId);
                    if (isNaN(userId) || userId <= 0) {
                        console.warn("Invalid userId, using default values");
                        return;
                    }
                } else {
                    console.warn("No userId found, using default values");
                    return;
                }

                console.log(`Fetching profile for userId: ${userId}`);
                const { data } = await axios.get(`/users/${userId}/profile`);
                console.log("Profile data received:", data);

                setFormData({
                    fullName: data.fullName || '',
                    email: data.email || '',
                    gender: data.gender || '',
                    pathology: data.pathology || '',
                    numberOfFamilyMembers: data.numberOfFamilyMembers ?? 1,
                    country: data.country || '',
                    favorite: data.favorite || 'Vegetarian',
                    ageGroups: {
                        children: data.ageGroups?.children ?? false,
                        teenagers: data.ageGroups?.teenagers ?? false,
                        adult: data.ageGroups?.adult ?? true,
                        oldPerson: data.ageGroups?.oldPerson ?? false
                    }
                });
            } catch (err) {
                // Silently fail - form will use default values
                // Log detailed error for debugging
                console.error("Failed to load profile (using defaults):", {
                    status: err.response?.status,
                    statusText: err.response?.statusText,
                    data: err.response?.data,
                    message: err.message
                });
            }
        };

        fetchProfile();
    }, []);

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };


    const handleSubmit = async () => {
        // Lấy userId từ localStorage (theo convention các màn khác)
        const userDataString = localStorage.getItem("user");
        const userData = userDataString ? JSON.parse(userDataString) : null;
        let userId = userData?.user?.id || userData?.id || localStorage.getItem("userId");
        
        // Validate userId
        if (!userId) {
            setSnackbar({
                open: true,
                message: 'User ID not found. Please login again.',
                severity: 'error'
            });
            return;
        }
        
        // Convert to number
        userId = Number(userId);
        if (isNaN(userId) || userId <= 0) {
            setSnackbar({
                open: true,
                message: 'Invalid User ID. Please login again.',
                severity: 'error'
            });
            return;
        }

        // Prepare request body according to API specification
        // Backend only updates: fullName, email, country, gender, pathology, favorite
        // numberOfFamilyMembers and ageGroups are calculated automatically
        // Only include fields that have values to avoid sending null/empty strings
        const requestBody = {};
        
        if (formData.fullName && formData.fullName.trim()) {
            requestBody.fullName = formData.fullName.trim();
        }
        if (formData.email && formData.email.trim()) {
            requestBody.email = formData.email.trim();
        }
        if (formData.country && formData.country.trim()) {
            requestBody.country = formData.country.trim();
        }
        if (formData.gender && formData.gender.trim()) {
            requestBody.gender = formData.gender.trim();
        }
        if (formData.pathology && formData.pathology.trim()) {
            requestBody.pathology = formData.pathology.trim();
        }
        if (formData.favorite && formData.favorite.trim()) {
            requestBody.favorite = formData.favorite.trim();
        }
        
        console.log('Submitting profile update:', requestBody);

        setIsLoading(true);

        try {
            // Dùng axios instance với baseURL http://localhost:8080/api
            const { data } = await axios.put(`/users/${userId}/profile`, requestBody);
            console.log('Profile updated successfully:', data);
            
            setSnackbar({
                open: true,
                message: 'Profile updated successfully!',
                severity: 'success'
            });

            // Navigate after a short delay to show success message
            setTimeout(() => {
                navigate('/manage/Dashboard');
            }, 1500);

        } catch (error) {
            console.error('Error updating profile:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            
            // Extract error message from response
            let errorMessage = 'Failed to update profile. Please try again.';
            if (error.response?.data) {
                if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                } else if (error.response.data.message) {
                    errorMessage = error.response.data.message;
                } else if (error.response.data.error) {
                    errorMessage = error.response.data.error;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            setSnackbar({
                open: true,
                message: errorMessage,
                severity: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <Box className="edit-profile-container">
            <Box className="profile-wrapper">
                <Box className="profile-header">
                    {/* User Info */}
                    <Box className="user-info-section">
                        <Avatar
                            src="https://images.unsplash.com/photo-1522770179533-24471fcdba45"
                            sx={{ width: 64, height: 64, border: '3px solid white' }}
                        />
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                            {formData.fullName}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            {formData.email}
                        </Typography>
                    </Box>
                    </Box>
                    <Button
                        variant="contained"
                        className="save-button"
                        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Edit />}
                        onClick={handleSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Saving...' : 'Save'}
                    </Button>
                </Box>

                {/* Form Content */}
                <Card className="form-card">
                <CardContent className="form-card-content">
                    <Grid container spacing={10} className="form-grid">
                        {/* Left Column */}
                        <Grid item xs={12} md={6} className="form-column">
                            <Typography variant="h6" className="section-title">
                                Personal Details
                            </Typography>

                            <TextField
                                fullWidth
                                label="Full Name"
                                value={formData.fullName}
                                onChange={(e) => handleChange('fullName', e.target.value)}
                                placeholder="Your First Name"
                                sx={{ 
                                    mb: 3,
                                    '& .MuiInputBase-input': {
                                        textAlign: 'center'
                                    }
                                }}
                            />

                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <InputLabel>Gender</InputLabel>
                                <Select
                                    label="Gender"
                                    value={formData.gender}
                                    onChange={(e) => handleChange('gender', e.target.value)}
                                    placeholder="Your First Name"
                                    sx={{
                                        '& .MuiSelect-select': {
                                            textAlign: 'center'
                                        }
                                    }}
                                >
                                    <MenuItem value="male">Male</MenuItem>
                                    <MenuItem value="female">Female</MenuItem>
                                    <MenuItem value="other">Other</MenuItem>
                                </Select>
                            </FormControl>

                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <InputLabel>Pathology</InputLabel>
                                <Select
                                    label="Pathology"
                                    value={formData.pathology}
                                    onChange={(e) => handleChange('pathology', e.target.value)}
                                    placeholder="allergy...."
                                    sx={{
                                        '& .MuiSelect-select': {
                                            textAlign: 'center'
                                        }
                                    }}
                                >
                                    <MenuItem value="allergy">Allergy</MenuItem>
                                    <MenuItem value="diabetes">Diabetes</MenuItem>
                                    <MenuItem value="hypertension">Hypertension</MenuItem>
                                    <MenuItem value="none">None</MenuItem>
                                </Select>
                            </FormControl>

                            <TextField
                                fullWidth
                                label="Email Address"
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                placeholder="your.email@example.com"
                                sx={{ 
                                    mb: 3,
                                    '& .MuiInputBase-input': {
                                        textAlign: 'center'
                                    }
                                }}
                                InputProps={{
                                    startAdornment: <Email sx={{ color: '#1976d2', mr: 1 }} />
                                }}
                            />
                        </Grid>

                        {/* Right Column */}
                        <Grid item xs={12} md={6} className="form-column">
                            <Typography variant="h6" className="section-title">
                                Family and Preferences
                            </Typography>

                            <TextField
                                fullWidth
                                label="Number of family members"
                                type="number"
                                value={formData.numberOfFamilyMembers}
                                onChange={(e) => handleChange('numberOfFamilyMembers', e.target.value)}
                                inputProps={{ min: 1 }}
                                sx={{ 
                                    mb: 3,
                                    '& .MuiInputBase-input': {
                                        textAlign: 'center'
                                    }
                                }}
                            />

                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <InputLabel>Country</InputLabel>
                                <Select
                                    label="Country"
                                    value={formData.country}
                                    onChange={(e) => handleChange('country', e.target.value)}
                                    placeholder="Your First Name"
                                    sx={{
                                        '& .MuiSelect-select': {
                                            textAlign: 'center'
                                        }
                                    }}
                                >
                                    <MenuItem value="vietnam">Vietnam</MenuItem>
                                    <MenuItem value="usa">United States</MenuItem>
                                    <MenuItem value="uk">United Kingdom</MenuItem>
                                    <MenuItem value="france">France</MenuItem>
                                </Select>
                            </FormControl>

                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <InputLabel>Favorite</InputLabel>
                                <Select
                                    label="Favorite"
                                    value={formData.favorite}
                                    onChange={(e) => handleChange('favorite', e.target.value)}
                                    sx={{
                                        '& .MuiSelect-select': {
                                            textAlign: 'center'
                                        }
                                    }}
                                >
                                    <MenuItem value="Vegetarian">Vegetarian</MenuItem>
                                    <MenuItem value="Vegan">Vegan</MenuItem>
                                    <MenuItem value="Meat Lover">Meat Lover</MenuItem>
                                    <MenuItem value="Balanced">Balanced</MenuItem>
                                </Select>
                            </FormControl>

                            {/* Age Groups */}
                            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
                                Age of family members:
                            </Typography>
                            
                        
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
            </Box>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default EditProfile;
