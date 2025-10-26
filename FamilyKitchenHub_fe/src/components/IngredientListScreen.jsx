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

// Dữ liệu giả định cho bảng
const ingredientsData = [
    { name: 'Ground Beef', expire: '21-03-2022', type: 'Meat', amount: 1596, position: 'Freezer', status: 'Out Date' },
    { name: 'Tomatoes', expire: '21-03-2022', type: 'Vegetables', amount: 1595, position: 'Main compartment', status: 'Out Date' },
    { name: 'Chicken Eggs', expire: '08-03-2022', type: 'Dairy & Eggs', amount: 1593, position: 'Door', status: 'Out Date' },
    { name: 'Fresh Milk', expire: '08-03-2022', type: 'Dairy & Eggs', amount: 1592, position: 'Main compartment', status: 'Out Date' },
];

const IngredientListScreen = ({ onNavigateToAdd }) => {
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingIngredient, setEditingIngredient] = useState(null);
    const [editFormData, setEditFormData] = useState({
        name: '',
        expire: '',
        type: '',
        amount: '',
        position: '',
        status: ''
    });

    const handleAddIngredient = () => {
        // Chuyển đến trang thêm nguyên liệu thông qua DashboardLayout
        if (onNavigateToAdd) {
            onNavigateToAdd();
        }
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
        <Box sx={{ p: 3 }}>
            
            {/* --- Warning Card --- */}
            <Paper elevation={3} sx={{ p: 2, mb: 4, borderLeft: '5px solid #ff4500' }}>
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
            <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
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
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 2 }}>
                <Typography variant="body2" sx={{ mr: 2 }}>Page</Typography>
                <TextField size="small" defaultValue="1" sx={{ width: 50, mr: 1 }} />
                <Typography variant="body2">of 30</Typography>
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
        </Box>
    );
};

export default IngredientListScreen;