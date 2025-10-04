// Simple confetti effect for celebrating ghost score improvements
export function triggerConfetti() {
  // Create confetti elements
  const confettiCount = 50;
  const confettiColors = ['#9b8cff', '#93ff7a', '#ff5470', '#fbbf24'];
  
  for (let i = 0; i < confettiCount; i++) {
    createConfettiPiece(confettiColors);
  }
}

function createConfettiPiece(colors: string[]) {
  const confetti = document.createElement('div');
  const color = colors[Math.floor(Math.random() * colors.length)];
  
  confetti.style.cssText = `
    position: fixed;
    top: -10px;
    left: ${Math.random() * 100}%;
    width: 10px;
    height: 10px;
    background: ${color};
    pointer-events: none;
    z-index: 9999;
    border-radius: 2px;
  `;
  
  document.body.appendChild(confetti);
  
  // Animate confetti falling
  const animation = confetti.animate([
    { 
      transform: 'translateY(0px) rotate(0deg)',
      opacity: 1
    },
    { 
      transform: `translateY(${window.innerHeight + 100}px) rotate(720deg)`,
      opacity: 0
    }
  ], {
    duration: 3000,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  });
  
  animation.onfinish = () => {
    document.body.removeChild(confetti);
  };
}
