import { useEffect, useRef } from 'react';

export function Decorations() {
  const containerRef = useRef(null);

  useEffect(() => {
    // Tạo hoa đào
    const createBlossom = () => {
      const blossom = document.createElement('div');
      blossom.className = 'blossom';
      blossom.innerHTML = '🌸';
      blossom.style.left = Math.random() * 100 + 'vw';
      blossom.style.fontSize = (15 + Math.random() * 20) + 'px';
      blossom.style.animation = `fallDown ${4 + Math.random() * 6}s linear forwards`;
      
      // Thêm hiệu ứng lắc nhẹ
      blossom.style.transform = `rotate(${Math.random() * 360}deg)`;
      containerRef.current?.appendChild(blossom);

      setTimeout(() => {
        blossom.remove();
      }, 4000);
    };

    // Tạo tiền xu
    const createCoin = () => {
      const coin = document.createElement('div');
      coin.className = 'lucky-coin';
      coin.style.left = Math.random() * 100 + 'vw';
      coin.style.animation = `coinFall ${3 + Math.random() * 4}s linear forwards`;
      
      // Thêm hiệu ứng lắc ngang
      const swayAmount = 100 + Math.random() * 200;
      coin.style.setProperty('--sway-amount', `${swayAmount}px`);
      
      containerRef.current?.appendChild(coin);

      setTimeout(() => {
        coin.remove();
      }, 3000);
    };

    // Tạo dây đèn
    const createLights = () => {
      const lights = document.createElement('div');
      lights.className = 'string-lights';
      
      // Tăng số lượng đèn và thêm màu sắc
      for (let i = 0; i < 30; i++) {
        const light = document.createElement('div');
        light.className = 'light';
        // Màu sắc đèn Tết
        const colors = [
          '#ff0000', // Đỏ
          '#ffd700', // Vàng
          '#00ff00', // Xanh lá
          '#ff69b4', // Hồng
          '#ff4500'  // Đỏ cam
        ];
        light.style.backgroundColor = colors[i % colors.length];
        light.style.animationDelay = `${i * 0.1}s`;
        light.style.animationDuration = `${0.5 + Math.random()}s`;
        lights.appendChild(light);
      }

      containerRef.current?.appendChild(lights);
    };

    // Tạo pháo hoa
    const createFirework = (isLeft = true) => {
      const firework = document.createElement('div');
      firework.className = `firework ${isLeft ? 'firework-left' : 'firework-right'}`;
      containerRef.current?.appendChild(firework);

      // Tạo các hạt pháo hoa
      const particleCount = 30;
      const colors = ['#ff0000', '#ffd700', '#ff69b4', '#00ff00', '#ffffff'];

      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'firework-particle';
        
        // Random màu sắc
        const color = colors[Math.floor(Math.random() * colors.length)];
        particle.style.background = color;
        particle.style.boxShadow = `0 0 6px ${color}`;

        // Random hướng bay
        const angle = (i * 360) / particleCount;
        const velocity = 3 + Math.random() * 3;
        const finalX = Math.cos(angle * Math.PI / 180) * velocity * 50;
        const finalY = Math.sin(angle * Math.PI / 180) * velocity * 50;

        particle.style.setProperty('--final-x', `${finalX}px`);
        particle.style.setProperty('--final-y', `${finalY}px`);

        firework.appendChild(particle);

        // Tạo tia lửa
        createSparks(firework, finalX, finalY, color);
      }

      // Xóa pháo hoa sau khi nổ xong
      setTimeout(() => {
        firework.remove();
      }, 1500);
    };

    // Tạo tia lửa
    const createSparks = (container, x, y, color) => {
      const sparkCount = 3;
      for (let i = 0; i < sparkCount; i++) {
        const spark = document.createElement('div');
        spark.className = 'spark';
        spark.style.setProperty('--spark-color', color);
        spark.style.left = `${x}px`;
        spark.style.bottom = `${y}px`;
        container.appendChild(spark);

        setTimeout(() => spark.remove(), 500);
      }
    };

    // Tạo nhiều phần tử hơn cho hiệu ứng đẹp hơn
    const blossomInterval = setInterval(createBlossom, 800); // Tăng delay lên 800ms (từ 200ms)
    const coinInterval = setInterval(createCoin, 1200); // Tăng delay lên 1200ms (từ 300ms)
    createLights();

    // Bắn pháo hoa định kỳ
    const leftFireworkInterval = setInterval(() => createFirework(true), 3000);  // Tăng delay lên 3000ms
    const rightFireworkInterval = setInterval(() => createFirework(false), 3500); // Tăng delay lên 3500ms

    return () => {
      clearInterval(blossomInterval);
      clearInterval(coinInterval);
      clearInterval(leftFireworkInterval);
      clearInterval(rightFireworkInterval);
    };
  }, []);

  return <div ref={containerRef} className="decorations" />;
} 