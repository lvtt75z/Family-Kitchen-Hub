import React, { useState } from 'react';
import { Box, AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Avatar, Chip, Dialog, DialogContent } from '@mui/material';
import { Dashboard, Group, Kitchen, Message, Help, Settings, Warning, AddCircle, Close } from '@mui/icons-material';

// --- Imports các màn hình nội dung ---
import IngredientListScreen from '../components/IngredientListScreen'; 
import AddIngredientScreen from '../components/AddIngredientScreen';
// Giả định bạn đã tạo các components này trong bước trước

// --- 1. Component SideNav (Thanh điều hướng) ---
const SideNav = ({ setView, openAddModal }) => {
    const menuItems = [
        { text: 'Dashboard', icon: <Dashboard />, view: 'dashboard' },
        { text: 'Users', icon: <Group />, view: 'users' },
        { text: 'Recipe Owners', icon: <Group />, view: 'owners' },
        { text: 'List of Ingredient', icon: <Kitchen />, view: 'list' },
        { text: 'Add Ingredient', icon: <AddCircle />, view: 'add' }, // Thêm Add vào Sidebar
        { text: 'Message', icon: <Message />, view: 'message' },
        { text: 'Help', icon: <Help />, view: 'help' },
        { text: 'Setting', icon: <Settings />, view: 'setting' },
    ];

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: 240,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: { width: 240, boxSizing: 'border-box' },
            }}
        >
            <Toolbar sx={{ backgroundColor: 'orange', minHeight: '64px !important' }}>
                <Typography variant="h6" color="white">Foodieland</Typography>
            </Toolbar>
            <List>
                {menuItems.map((item) => (
                    <ListItem key={item.view} disablePadding>
                        <ListItemButton onClick={() => item.view === 'add' ? openAddModal() : setView(item.view)}>
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Drawer>
    );
};


// --- 2. Component DashboardLayout (Main Component) ---
const DashboardLayout = () => {
    // Trạng thái quản lý Component nào đang được hiển thị
    const [currentView, setCurrentView] = useState('list');
    const [isAddOpen, setIsAddOpen] = useState(false);

    // Hàm ánh xạ trạng thái sang Component nội dung
    const renderContent = () => {
        switch (currentView) {
            case 'list':
                return <IngredientListScreen onNavigateToAdd={() => setCurrentView('add')} />;
            case 'add':
                return <AddIngredientScreen onNavigateToList={() => setCurrentView('list')} />;
            case 'dashboard':
                return <Typography sx={{ p: 4 }}>Trang Dashboard Chính</Typography>;
            case 'users':
                return <Typography sx={{ p: 4 }}>Quản lý Người dùng</Typography>;
            // Thêm các cases khác ở đây
            default:
                return <Typography sx={{ p: 4 }}>Nội dung cho {currentView}</Typography>;
        }
    };

    return (
        <Box sx={{ display: 'flex' }}>
            {/* Thanh điều hướng bên trái */}
            <SideNav setView={setCurrentView} openAddModal={() => setIsAddOpen(true)} />
            
            <Box component="main" sx={{ flexGrow: 1, p: 0 }}>
                
                {/* Thanh Header trên cùng */}
                <AppBar position="static" sx={{ bgcolor: 'white', borderBottom: '1px solid #eee' }} elevation={0}>
                    <Toolbar>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'black' }}>
                            Hello, PK
                            <Typography variant="body2" sx={{ color: 'gray' }}>Have a nice day</Typography>
                        </Typography>
                        
                        {/* Warning Box (Sử dụng Chip cho ví dụ)
                        <Chip
                            icon={<Warning />}
                            label="Out of Date !!!"
                            color="error"
                            onDelete={() => console.log('Warning closed')} // Logic để đóng cảnh báo
                            deleteIcon={<Close />} 
                            sx={{ mr: 2 }}
                        /> */}

                        {/* User Profile */}
                        <Avatar alt="PK" sx={{ mr: 1, bgcolor: 'brown' }}>PK</Avatar>
                        <Typography variant="body1" sx={{ color: 'black' }}>PK User</Typography>
                    </Toolbar>
                </AppBar>

                {/* Khu vực Nội dung chính (Thay đổi theo SideNav) */}
                <Box sx={{ overflowY: 'auto', height: 'calc(100vh - 64px)' }}>
                    {/* Luôn hiển thị danh sách; form Add mở dạng modal chồng lên */}
                    <IngredientListScreen onNavigateToAdd={() => setIsAddOpen(true)} />
                </Box>

                {/* Add Ingredient Modal */}
                <Dialog open={isAddOpen} onClose={() => setIsAddOpen(false)} maxWidth="md" fullWidth>
                    <DialogContent sx={{ p: 0 }}>
                        <AddIngredientScreen onNavigateToList={() => setIsAddOpen(false)} />
                    </DialogContent>
                </Dialog>
            </Box>
        </Box>
    );
};

export default DashboardLayout;