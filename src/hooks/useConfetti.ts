import confetti from 'canvas-confetti';

export function fireConfetti() {
  // Double burst depuis les deux côtés
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { x: 0.3, y: 0.6 },
    colors: ['#16a34a', '#f59e0b', '#ffffff', '#fbbf24'],
  });
  setTimeout(() => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { x: 0.7, y: 0.6 },
      colors: ['#16a34a', '#f59e0b', '#ffffff', '#fbbf24'],
    });
  }, 150);
}

export function fireStreakConfetti(streak: number) {
  if (streak < 3) return;
  confetti({
    particleCount: streak * 10,
    spread: 100,
    startVelocity: 40,
    origin: { x: 0.5, y: 0.4 },
    colors: ['#f59e0b', '#fbbf24', '#fcd34d'],
    shapes: ['star'],
  });
}
