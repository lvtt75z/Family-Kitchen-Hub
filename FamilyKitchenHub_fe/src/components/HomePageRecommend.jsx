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
                    What should the family <br /> eat today?
                </h1>
                <p className="recommend-subtitle">
                    Discover smart menu recommendations personalized by AI.
                    Save time, complete nutrition for the whole family.
                </p>
                <button
                    className="recommend-btn"
                    onClick={() => navigate('/manage/recommendations')}
                >
                    <Sparkles size={24} fill="white" />
                    Get Recommendations
                </button>
            </div>
        </div>
    );
};

export default HomePageRecommend;