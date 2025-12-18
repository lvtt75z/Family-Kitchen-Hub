import React from 'react';
import { useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import foodChoiceAnimation from '../assets/Food Choice.json';
import { Sparkles } from 'lucide-react';
import '../styles/HomePageRecommend.css';

const HomePageRecommend = () => {
    const navigate = useNavigate();

    return (
        <div className="recommend-container ">
            {/* Left Column: Animation */}
            <div className="left-col">
                <div className="animation-wrapper">
                    <Lottie
                        animationData={foodChoiceAnimation}
                        loop={true}
                        autoplay={true}
                    />
                </div>
            </div>

            {/* Right Column: Text + CTA */}
            <div className="right-col">
                <h1 className="recommend-title">
                    Hôm nay gia đình <br /> ăn gì?
                </h1>
                <p className="recommend-subtitle">
                    Khám phá thực đơn thông minh được cá nhân hóa bởi AI.
                    Tiết kiệm thời gian, trọn vẹn dinh dưỡng cho cả gia đình.
                </p>
                <button
                    className="recommend-btn"
                    onClick={() => navigate('/manage/recommendations')}
                >
                    <Sparkles size={24} fill="white" />
                    Gợi ý ngay
                </button>
            </div>
        </div>
    );
};

export default HomePageRecommend;