import React, { useEffect, useState } from 'react';

export default function Marquee() {
    const [draws, setDraws] = useState([]);

    useEffect(() => {
        // Lấy dữ liệu từ localStorage
        const storedDraws = Object.entries(localStorage)
            .filter(([key]) => key.startsWith('draw_'))
            .map(([key, value]) => JSON.parse(value))
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setDraws(storedDraws);
    }, []);

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-red-600 text-white py-2 z-50">
            <div className="marquee-container overflow-hidden whitespace-nowrap">
                <div className="animate-marquee inline-block">
                    {draws.map((draw, index) => (
                        <span key={draw.id} className="mx-4">
                            🧧 {draw.bankInfo.accountName} vừa rút được {draw.amount.toLocaleString()}đ
                            {index < draws.length - 1 ? ' • ' : ''}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
} 