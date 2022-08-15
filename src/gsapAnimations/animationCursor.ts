import gsap from 'gsap';

export function animateCursor(clientX: number, clientY: number) {
  gsap.to('.cursor', {
    x: clientX,
    y: clientY,
    ease: 'Power4.easeOut',
    duration: 1.5,
  });
}
