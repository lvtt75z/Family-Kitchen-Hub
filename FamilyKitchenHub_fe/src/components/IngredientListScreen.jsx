import React, { useState } from 'react';
import { 
    Box, 
    Typography, 
    Button, 
    Paper, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    TextField,
    InputAdornment,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { Search, Add, Edit, DeleteOutline, Save, Cancel } from '@mui/icons-material';
import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AddIngredientScreen from './AddIngredientScreen';
import '../styles/IngredientListScreen.css';

// Dữ liệu giả định cho bảng
const ingredientsData = [
    { name: 'Ground Beef', expire: '21-03-2022', type: 'Meat', amount: 1596, position: 'Freezer', status: 'Out Date' },
    { name: 'Tomatoes', expire: '21-03-2022', type: 'Vegetables', amount: 1595, position: 'Main compartment', status: 'Out Date' },
    { name: 'Chicken Eggs', expire: '08-03-2022', type: 'Dairy & Eggs', amount: 1593, position: 'Door', status: 'Out Date' },
    { name: 'Fresh Milk', expire: '08-03-2022', type: 'Dairy & Eggs', amount: 1592, position: 'Main compartment', status: 'Out Date' },
];

const IngredientListScreen = () => {
    const navigate = useNavigate();
    const [showAddScreen, setShowAddScreen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [_editingIngredient, setEditingIngredient] = useState(null);
    const [editFormData, setEditFormData] = useState({
        name: '',
        expire: '',
        type: '',
        amount: '',
        position: '',
        status: ''
    });

    const handleAddIngredient = () => {
        setShowAddScreen(true);
    };

    const handleCloseAddScreen = () => {
        setShowAddScreen(false);
    };

    const handleEditIngredient = (ingredient) => {
        setEditingIngredient(ingredient);
        setEditFormData({
            name: ingredient.name,
            expire: ingredient.expire,
            type: ingredient.type,
            amount: ingredient.amount.toString(),
            position: ingredient.position,
            status: ingredient.status
        });
        setEditDialogOpen(true);
    };

    const handleSaveEdit = () => {
        console.log('Lưu chỉnh sửa:', editFormData);
        // TODO: Gọi API để cập nhật nguyên liệu
        alert(`Đã cập nhật nguyên liệu "${editFormData.name}" thành công!`);
        setEditDialogOpen(false);
        setEditingIngredient(null);
    };

    const handleCancelEdit = () => {
        setEditDialogOpen(false);
        setEditingIngredient(null);
        setEditFormData({
            name: '',
            expire: '',
            type: '',
            amount: '',
            position: '',
            status: ''
        });
    };

    const handleEditFormChange = (field, value) => {
        setEditFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleDeleteIngredient = (ingredient) => {
        // Hiển thị dialog xác nhận xóa
        if (window.confirm(`Bạn có chắc chắn muốn xóa nguyên liệu "${ingredient.name}"?`)) {
            // Xử lý xóa nguyên liệu
            console.log('Xóa nguyên liệu:', ingredient.name);
            // TODO: Gọi API xóa nguyên liệu
        }
    };

    return (
        <Box className="ingredient-list-container">
            {/* --- Smart Recommendation Widget --- */}
            <Paper 
                elevation={3} 
                className="smart-recommendation-widget"
                sx={{
                    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                    color: 'white',
                    padding: '24px',
                    marginBottom: '24px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 16px rgba(249, 115, 22, 0.3)',
                    }
                }}
                onClick={() => navigate('/manage/recommendations')}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                            Hôm nay gia đình ăn gì?
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Để AI gợi ý thực đơn phù hợp nhất cho gia đình bạn
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 24px',
                            background: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: '8px',
                            backdropFilter: 'blur(10px)',
                        }}
                    >
                        <Sparkles size={24} />
                        <Typography variant="button" sx={{ fontWeight: 600 }}>
                            Gợi ý thực đơn ngay
                        </Typography>
                    </Box>
                </Box>
            </Paper>
            
            {/* --- Warning Card --- */}
            <Paper elevation={3} className="warning-card">
                <Typography variant="h6" color="error" sx={{ fontWeight: 'bold' }}>
                    Warning
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                    Cảnh báo hạn sử dụng
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                    4 nguyên liệu đã hết hạn: Ground Beef, Tomatoes, Chicken Eggs, Fresh Milk
                </Typography>
                <Button variant="text" sx={{ mt: 1, textTransform: 'none' }}>
                    View Badges
                </Button>
            </Paper>

            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
                List of Ingredient
            </Typography>

            {/* --- Filter & Search Section --- */}
            <Box className="filter-section">
                {/* Simplified Filters - You would replace these with actual date/select inputs */}
                <TextField label="Date" size="small" sx={{ width: 150 }} />
                <TextField label="Date" size="small" sx={{ width: 150 }} />
                
                <TextField
                    label="Find Ingredient"
                    size="small"
                    sx={{ width: 250 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search />
                            </InputAdornment>
                        ),
                    }}
                />
                <Button 
                    variant="contained" 
                    color="primary" 
                    startIcon={<Add />}
                    onClick={handleAddIngredient}
                >
                    Add
                </Button>
                <Button variant="contained" color="primary" sx={{ ml: 'auto' }}>
                    Filter
                </Button>
            </Box>

            {/* --- Data Table --- */}
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="ingredient table">
                    <TableHead>
                        <TableRow>
                            {/* Cột Status chỉ là ví dụ, trong thực tế sẽ là checkbox/icon */}
                            <TableCell>Status</TableCell> 
                            <TableCell>Date</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Expire</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell align="right">Amount</TableCell>
                            <TableCell>Position</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="center">Edit</TableCell>
                            <TableCell align="center">Delete Other</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {ingredientsData.map((row) => (
                            <TableRow key={row.name} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell>...</TableCell> 
                                <TableCell>...</TableCell>
                                <TableCell component="th" scope="row">{row.name}</TableCell>
                                <TableCell>{row.expire}</TableCell>
                                <TableCell>{row.type}</TableCell>
                                <TableCell align="right">{row.amount}</TableCell>
                                <TableCell>{row.position}</TableCell>
                                <TableCell color="error">{row.status}</TableCell>
                                <TableCell align="center">
                                    <IconButton 
                                        color="primary"
                                        onClick={() => handleEditIngredient(row)}
                                    >
                                        <Edit />
                                    </IconButton>
                                </TableCell>
                                <TableCell align="center">
                                    <IconButton 
                                        color="error"
                                        onClick={() => handleDeleteIngredient(row)}
                                    >
                                        <DeleteOutline />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            
            {/* Pagination is simplified */}
           {/* Pagination */}
           <Box className="pagination-container">
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
            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onClose={handleCancelEdit} maxWidth="md" fullWidth>
                <DialogTitle>Chỉnh sửa nguyên liệu</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Tên nguyên liệu"
                            value={editFormData.name}
                            onChange={(e) => handleEditFormChange('name', e.target.value)}
                            variant="outlined"
                        />
                        <TextField
                            fullWidth
                            label="Ngày hết hạn"
                            type="date"
                            value={editFormData.expire}
                            onChange={(e) => handleEditFormChange('expire', e.target.value)}
                            variant="outlined"
                            InputLabelProps={{ shrink: true }}
                            sx={{
                                '& .MuiInputBase-input': {
                                    cursor: 'pointer'
                                }
                            }}
                            InputProps={{
                                // Đảm bảo Input type="date" hoạt động
                            }}
                        />
                        <FormControl fullWidth variant="outlined">
                            <InputLabel>Loại</InputLabel>
                            <Select
                                label="Loại"
                                value={editFormData.type}
                                onChange={(e) => handleEditFormChange('type', e.target.value)}
                            >
                                <MenuItem value="Meat">Meat</MenuItem>
                                <MenuItem value="Vegetables">Vegetables</MenuItem>
                                <MenuItem value="Dairy & Eggs">Dairy & Eggs</MenuItem>
                                <MenuItem value="Other">Other</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            label="Số lượng"
                            type="number"
                            value={editFormData.amount}
                            onChange={(e) => handleEditFormChange('amount', e.target.value)}
                            variant="outlined"
                        />
                        <FormControl fullWidth variant="outlined">
                            <InputLabel>Vị trí lưu trữ</InputLabel>
                            <Select
                                label="Vị trí lưu trữ"
                                value={editFormData.position}
                                onChange={(e) => handleEditFormChange('position', e.target.value)}
                            >
                                <MenuItem value="Freezer">Freezer</MenuItem>
                                <MenuItem value="Main compartment">Main compartment</MenuItem>
                                <MenuItem value="Door">Door</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl fullWidth variant="outlined">
                            <InputLabel>Trạng thái</InputLabel>
                            <Select
                                label="Trạng thái"
                                value={editFormData.status}
                                onChange={(e) => handleEditFormChange('status', e.target.value)}
                            >
                                <MenuItem value="Fresh">Fresh</MenuItem>
                                <MenuItem value="Expiring Soon">Expiring Soon</MenuItem>
                                <MenuItem value="Out Date">Out Date</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelEdit} startIcon={<Cancel />}>
                        Hủy
                    </Button>
                    <Button onClick={handleSaveEdit} variant="contained" startIcon={<Save />}>
                        Lưu
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Add Ingredient Overlay */}
            {showAddScreen && (
                <Box
                    onClick={handleCloseAddScreen}
                    className="overlay-backdrop"
                >
                    <Box
                        onClick={(e) => e.stopPropagation()}
                        className="overlay-content"
                    >
                        <AddIngredientScreen onClose={handleCloseAddScreen} />
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default IngredientListScreen;