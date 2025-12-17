import { useState, useEffect } from 'react';
import axios from './axios';

export const useUser = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userStorage = localStorage.getItem('user');
                if (userStorage) {
                    const userMinimal = JSON.parse(userStorage);
                    if (userMinimal?.id) {
                        // Only fetch if we need fresh data, otherwise we can just return what's in local storage
                        // But per requirement, this hook is for "fetching full data"
                        const res = await axios.get(`/users/${userMinimal.id}`);
                        setUser(res.data);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch user', error);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    return { user, loading };
};
