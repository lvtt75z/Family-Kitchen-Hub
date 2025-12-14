import React, { useState, useEffect } from 'react';
import { getDashboardStats, getHotSearches, getTopRecipes } from '../../service/analyticsService';
import './DashboardPage.css';

export default function DashboardPage() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalRecipes: 0,
        totalIngredients: 0,
        totalCategories: 0
    });
    const [hotKeywords, setHotKeywords] = useState([]);
    const [topRecipes, setTopRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [chartsLoading, setChartsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStats();
        fetchChartData();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const data = await getDashboardStats();
            setStats(data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch stats:', err);
            setError('Failed to load statistics');
        } finally {
            setLoading(false);
        }
    };

    const fetchChartData = async () => {
        try {
            setChartsLoading(true);
            const [keywords, recipes] = await Promise.all([
                getHotSearches(10),
                getTopRecipes(10)
            ]);
            setHotKeywords(keywords);
            setTopRecipes(recipes);
        } catch (err) {
            console.error('Failed to fetch chart data:', err);
        } finally {
            setChartsLoading(false);
        }
    };

    return (
        <div className="dashboard-page">
            <h2 className="page-title">Dashboard Overview</h2>

            {error && (
                <div className="error-message">
                    {error}
                    <button onClick={fetchStats}>Retry</button>
                </div>
            )}

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-details">
                        <h3>Total Users</h3>
                        <p className="stat-value">{loading ? 'Loading...' : stats.totalUsers}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">📝</div>
                    <div className="stat-details">
                        <h3>Total Recipes</h3>
                        <p className="stat-value">{loading ? 'Loading...' : stats.totalRecipes}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">🥕</div>
                    <div className="stat-details">
                        <h3>Ingredients</h3>
                        <p className="stat-value">{loading ? 'Loading...' : stats.totalIngredients}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">📁</div>
                    <div className="stat-details">
                        <h3>Categories</h3>
                        <p className="stat-value">{loading ? 'Loading...' : stats.totalCategories}</p>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="charts-section">
                {/* Hot Keywords Chart */}
                <div className="chart-card">
                    <h3>🔥 Hot Search Keywords</h3>
                    {chartsLoading ? (
                        <p className="chart-loading">Loading chart data...</p>
                    ) : hotKeywords.length > 0 ? (
                        <div className="bar-chart">
                            {hotKeywords.map((item, index) => {
                                const maxCount = hotKeywords[0]?.count || 1;
                                const percentage = (item.count / maxCount) * 100;
                                return (
                                    <div key={index} className="bar-item">
                                        <div className="bar-label">
                                            <span className="bar-rank">#{index + 1}</span>
                                            <span className="bar-title">{item.keyword}</span>
                                        </div>
                                        <div className="bar-container">
                                            <div
                                                className="bar-fill"
                                                style={{ width: `${percentage}%` }}
                                            >
                                                <span className="bar-value">{item.count}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="chart-placeholder">No search data available</p>
                    )}
                </div>

                {/* Top 10 Recipes Leaderboard */}
                <div className="chart-card">
                    <h3>🏆 Top 10 Recipes</h3>
                    {chartsLoading ? (
                        <p className="chart-loading">Loading chart data...</p>
                    ) : topRecipes.length > 0 ? (
                        <div className="leaderboard">
                            {topRecipes.map((recipe, index) => {
                                const medals = ['🥇', '🥈', '🥉'];
                                const medal = index < 3 ? medals[index] : `#${index + 1}`;
                                return (
                                    <div key={recipe.recipeId} className={`leaderboard-item rank-${index + 1}`}>
                                        <div className="leaderboard-rank">
                                            <span className="rank-badge">{medal}</span>
                                        </div>
                                        <div className="leaderboard-content">
                                            <div className="leaderboard-title">{recipe.recipeTitle}</div>
                                            <div className="leaderboard-stats">
                                                <span className="stat-badge">⭐ {recipe.popularityScore.toFixed(1)}</span>
                                                <span className="stat-badge">🔍 {recipe.searchCount}</span>
                                                <span className="stat-badge">❤️ {recipe.bookmarkCount}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="chart-placeholder">No recipe data available</p>
                    )}
                </div>
            </div>
        </div>
    );
}
