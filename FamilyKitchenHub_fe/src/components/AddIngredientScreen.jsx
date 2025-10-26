import React, { useState } from 'react';
import {
    Box, 
    Button, 
    Card, 
    CardContent, 
    Grid, 
    TextField, 
    Typography, 
    MenuItem, 
    Select, 
    FormControl, 
    InputLabel,
    IconButton,
    Autocomplete
} from '@mui/material';
import { Add, Quickreply, MoreVert, Close } from '@mui/icons-material';

const AddIngredientScreen = ({ onNavigateToList }) => {
    // State cho form
    const [formData, setFormData] = useState({
        ingredientName: '',
        category: '',
        quantity: '0.1',
        unit: '',
        storageLocation: '',
        expiryDate: ''
    });

    // Dữ liệu giả định cho Select
    const categories = ['Meat', 'Vegetables', 'Dairy & Eggs', 'Other'];
    const units = ['gram', 'ml', 'lát', 'unit'];
    const locations = ['Freezer', 'Main Compartment', 'Door'];

    // Dữ liệu nguyên liệu theo category
    const ingredientSuggestions = {
        'Meat': ['Ground Beef', 'Chicken Breast', 'Pork Chop', 'Lamb', 'Turkey', 'Bacon', 'Sausage', 'Ham'],
        'Vegetables': ['Tomatoes', 'Carrots', 'Onions', 'Potatoes', 'Broccoli', 'Spinach', 'Lettuce', 'Bell Peppers', 'Cucumber', 'Celery'],
        'Dairy & Eggs': ['Fresh Milk', 'Chicken Eggs', 'Cheese', 'Yogurt', 'Butter', 'Cream', 'Cottage Cheese'],
        'Other': ['Rice', 'Pasta', 'Bread', 'Flour', 'Sugar', 'Salt', 'Oil', 'Vinegar']
    };

    // Lấy danh sách gợi ý theo category đã chọn
    const getSuggestions = () => {
        return formData.category ? ingredientSuggestions[formData.category] || [] : [];
    };

    // Xử lý thay đổi form
    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Xử lý submit form
    const handleSubmit = () => {
        console.log('Form data:', formData);
        // TODO: Gọi API để lưu nguyên liệu
        alert('Nguyên liệu đã được thêm thành công!');
        onNavigateToList(); // Đóng modal và quay về danh sách
    };

    return (
        <Box sx={{ backgroundColor: 'white' }}>
            {/* Top Action Bar */}
            <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                p: 2,
                borderBottom: '1px solid #e0e0e0'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton>
                        <MoreVert />
                    </IconButton>
                    <Button 
                        variant="contained" 
                        sx={{ 
                            bgcolor: '#ff6b35', 
                            '&:hover': { bgcolor: '#e55a2b' },
                            textTransform: 'none',
                            fontWeight: 'bold'
                        }} 
                        startIcon={<Add />}
                    >
                        Add Ingredient
                    </Button>
                    <Button 
                        variant="contained" 
                        sx={{ 
                            bgcolor: '#87ceeb', 
                            '&:hover': { bgcolor: '#7bc4dc' },
                            textTransform: 'none',
                            fontWeight: 'bold'
                        }} 
                        startIcon={<Quickreply />}
                    >
                        Quick Add
                    </Button>
                </Box>
                <IconButton onClick={onNavigateToList}>
                    <Close />
                </IconButton>
            </Box>

            {/* Main Form Card */}
            <Box sx={{ p: 3 }}>
                <Card sx={{ 
                    maxWidth: 800, 
                    mx: 'auto',
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <CardContent sx={{ p: 4 }}>
                        <Grid container spacing={3}>
                            {/* Basic Information Section */}
                            <Grid item xs={12}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                                    Basic Information
                                </Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={7}>
                                        <Autocomplete
                                            freeSolo
                                            options={getSuggestions()}
                                            value={formData.ingredientName}
                                            onChange={(event, newValue) => {
                                                handleChange('ingredientName', newValue || '');
                                            }}
                                            onInputChange={(event, newInputValue) => {
                                                handleChange('ingredientName', newInputValue);
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Ingredient Name *"
                                                    placeholder="E.g, Pork, Egg Fire"
                                                    variant="outlined"
                                                    sx={{ 
                                                        width: '480px',
                                                        height: '64px',
                                                        '& .MuiOutlinedInput-root': {
                                                            height: '64px'
                                                        },
                                                        '& .MuiInputLabel-root': { 
                                                            fontSize: '14px',
                                                            fontWeight: 500
                                                        },
                                                        '& .MuiInputBase-input': { 
                                                            fontSize: '14px',
                                                            padding: '20px 14px',
                                                            height: '24px'
                                                        }
                                                    }}
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={5}>
                                        <FormControl fullWidth variant="outlined" sx={{ height: '64px', width: 300 }}>
                                            <InputLabel sx={{ fontSize: '14px', fontWeight: 500 }}>Category</InputLabel>
                                            <Select 
                                                label="Category" 
                                                value={formData.category}
                                                onChange={(e) => handleChange('category', e.target.value)}
                                                sx={{ 
                                                    height: '64px',
                                                    '& .MuiOutlinedInput-notchedOutline': {
                                                        height: '64px'
                                                    },
                                                    '& .MuiSelect-select': { 
                                                        fontSize: '14px',
                                                        padding: '20px 14px',
                                                        height: '24px',
                                                        display: 'flex',
                                                        alignItems: 'center'
                                                    }
                                                }}
                                            >
                                                <MenuItem value="">
                                                    <em>Select Category</em>
                                                </MenuItem>
                                                {categories.map(cat => (
                                                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </Grid>

                            {/* Quantity & Unit Section */}
                            <Grid item xs={12}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                                    Quantity & Unit
                                </Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={7}>
                                        <TextField
                                            fullWidth
                                            label="Quantity*"
                                            value={formData.quantity}
                                            onChange={(e) => handleChange('quantity', e.target.value)}
                                            variant="outlined"
                                            sx={{ 
                                                height: '64px',
                                                '& .MuiOutlinedInput-root': {
                                                    height: '64px'
                                                },
                                                '& .MuiInputLabel-root': { 
                                                    fontSize: '14px',
                                                    fontWeight: 500
                                                },
                                                '& .MuiInputBase-input': { 
                                                    fontSize: '14px',
                                                    padding: '20px 14px',
                                                    height: '24px'
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={5}>
                                        <FormControl fullWidth variant="outlined" sx={{ height: '64px', width: 300 }}>
                                            <InputLabel sx={{ fontSize: '14px', fontWeight: 500 }}>Unit*</InputLabel>
                                            <Select 
                                                label="Unit*" 
                                                value={formData.unit}
                                                onChange={(e) => handleChange('unit', e.target.value)}
                                                sx={{ 
                                                    height: '64px',
                                                    '& .MuiOutlinedInput-notchedOutline': {
                                                        height: '64px'
                                                    },
                                                    '& .MuiSelect-select': { 
                                                        fontSize: '14px',
                                                        padding: '20px 14px',
                                                        height: '24px',
                                                        display: 'flex',
                                                        alignItems: 'center'
                                                    }
                                                }}
                                            >
                                                <MenuItem value="">
                                                    <em>Select Unit</em>
                                                </MenuItem>
                                                {units.map(unit => (
                                                    <MenuItem key={unit} value={unit}>{unit}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </Grid>

                            {/* Storage Information Section */}
                            <Grid item xs={12}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                                    Storage Information
                                </Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={7}>
                                        <FormControl fullWidth variant="outlined" sx={{ height: '64px', width: 300 }}>
                                            <InputLabel sx={{ fontSize: '14px', fontWeight: 500 }}>Storage Location</InputLabel>
                                            <Select 
                                                label="Storage Location" 
                                                value={formData.storageLocation}
                                                onChange={(e) => handleChange('storageLocation', e.target.value)}
                                                sx={{ 
                                                    height: '64px',
                                                    '& .MuiOutlinedInput-notchedOutline': {
                                                        height: '64px'
                                                    },
                                                    '& .MuiSelect-select': { 
                                                        fontSize: '14px',
                                                        padding: '20px 14px',
                                                        height: '24px',
                                                        display: 'flex',
                                                        alignItems: 'center'
                                                    }
                                                }}
                                            >
                                                <MenuItem value="">
                                                    <em>Select Location</em>
                                                </MenuItem>
                                                {locations.map(loc => (
                                                    <MenuItem key={loc} value={loc}>{loc}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={5}>
                                        <TextField
                                            fullWidth
                                            label="Expiry Date *"
                                            type="date"
                                            value={formData.expiryDate}
                                            onChange={(e) => handleChange('expiryDate', e.target.value)}
                                            variant="outlined"
                                            InputLabelProps={{ shrink: true }}
                                            sx={{ 
                                                height: '64px',
                                                width: 300,
                                                '& .MuiOutlinedInput-root': {
                                                    height: '64px'
                                                },
                                                '& .MuiInputLabel-root': { 
                                                    fontSize: '14px',
                                                    fontWeight: 500
                                                },
                                                '& .MuiInputBase-input': { 
                                                    fontSize: '14px',
                                                    padding: '20px 14px',
                                                    cursor: 'pointer'
                                                }
                                            }}
                                            InputProps={{
                                                // Đảm bảo Input type="date" hoạt động
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* Bottom Action Button */}
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                    <Button 
                        variant="contained" 
                        sx={{ 
                            bgcolor: '#ff6b35', 
                            '&:hover': { bgcolor: '#e55a2b' }, 
                            px: 4,
                            py: 1.5,
                            textTransform: 'none',
                            fontWeight: 'bold',
                            fontSize: '16px'
                        }}
                        startIcon={<Add />}
                        onClick={handleSubmit}
                    >
                        Add Ingredient
                    </Button>
                </Box>

                {/* Pagination */}
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    mt: 3,
                    gap: 1
                }}>
                    <Typography variant="body2">Page</Typography>
                    <IconButton size="small">‹</IconButton>
                    <Typography variant="body2" sx={{ 
                        bgcolor: '#1976d2', 
                        color: 'white', 
                        px: 1, 
                        borderRadius: 1 
                    }}>
                        1
                    </Typography>
                    <IconButton size="small">›</IconButton>
                    <Typography variant="body2">30</Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default AddIngredientScreen;