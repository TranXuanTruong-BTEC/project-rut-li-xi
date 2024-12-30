export function checkLuckyTime() {
    const targetDate = new Date('2025-01-01T06:00:00+07:00'); // 6 giờ sáng ngày 1/1/2025
    const now = new Date();

    if (now < targetDate) {
        const timeLeft = targetDate - now;
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        return {
            canDraw: false,
            timeLeft: {
                days,
                hours,
                minutes,
                seconds
            },
            message: 'Chưa đến thời gian rút lì xì. Vui lòng quay lại vào 6 giờ sáng ngày mùng 1 Tết!'
        };
    }

    return {
        canDraw: true,
        timeLeft: null,
        message: ''
    };
} 