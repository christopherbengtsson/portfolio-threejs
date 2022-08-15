import gsap from 'gsap';

export function animateScrollToStart(autoScroll: object, onUpdate: () => void) {
  gsap.to(autoScroll, {
    scrollPos: 0,
    ease: 'Expo.easeInOut',
    duration: 2,
    onUpdate,
  });
}

export function animateAutoScroll(autoScroll: object) {
  gsap.to(autoScroll, {
    delay: 0.7,
    autoMoveSpeed: 20,
    duration: 0.5,
  });
}

export function stopAutoScrollAnimation(autoScroll: object) {
  gsap.killTweensOf(autoScroll, { autoMoveSpeed: true });
}
