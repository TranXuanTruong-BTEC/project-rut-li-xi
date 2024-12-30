export const checkDrawLimit = () => {
    // Kiểm tra theo ngày
    const today = new Date().toDateString();
    const drawHistory = JSON.parse(localStorage.getItem('drawHistory') || '{}');
    
    // Nếu là ngày mới, reset lịch sử
    if (drawHistory.date !== today) {
        localStorage.setItem('drawHistory', JSON.stringify({
            date: today,
            draws: []
        }));
        return {
            canDraw: true,
            message: ''
        };
    }

    // Kiểm tra số lần đã rút trong ngày
    const MAX_DRAWS_PER_DAY = 1;
    if (drawHistory.draws.length >= MAX_DRAWS_PER_DAY) {
        return {
            canDraw: false,
            message: 'Bạn đã rút lì xì hôm nay rồi. Vui lòng quay lại vào ngày mai!'
        };
    }

    return {
        canDraw: true,
        message: ''
    };
};

export const recordDraw = (drawData) => {
    const today = new Date().toDateString();
    const drawHistory = JSON.parse(localStorage.getItem('drawHistory') || '{}');
    
    localStorage.setItem('drawHistory', JSON.stringify({
        date: today,
        draws: [...(drawHistory.draws || []), drawData]
    }));
}; 