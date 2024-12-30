import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function LuckyDraw() {
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            window.Echo.private(`user.${user.id}`)
                .listen('PaymentSuccessful', (e: any) => {
                    fetchStats();
                });
        }

        return () => {
            if (user) {
                window.Echo.leave(`user.${user.id}`);
            }
        };
    }, [user]);
} 