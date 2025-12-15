import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/IngredientListScreen.css';

const IngredientListScreen = () => {
    const navigate = useNavigate();

    return (
        <Box
            className="ingredient-list-container"
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '70vh',
                padding: '24px'
            }}
        >
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
                    maxWidth: '800px',
                    width: '100%',
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
        </Box>
    );
};

export default IngredientListScreen;