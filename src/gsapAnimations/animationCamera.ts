import gsap from 'gsap';
import { Event, Object3D } from 'three';
import { camera } from '../core/threejs/camera';

export function animateMoveToStart() {
  gsap.to(camera.position, {
    y: 0,
    ease: 'Expo.easeInOut',
    duration: 2,
  });

  gsap.to('.loading', {
    y: '-100%',
    ease: 'Expo.easeInOut',
    duration: 2,
    onComplete: () => {
      (document.querySelector('.loading') as HTMLElement).style.display = 'none';
    },
  });

  gsap.to('.social', {
    y: 0,
    delay: 1,
    ease: 'Expo.easeInOut',
    duration: 2,
  });
}

export function animatePerspective(
  mousePerspectiveY: number,
  mousePerspectiveX: number,
  lastCategory: boolean,
  arrow: Object3D<Event>
) {
  gsap.to(camera.rotation, {
    x: -mousePerspectiveY * 0.5,
    y: -mousePerspectiveX * 0.5,
    ease: 'Power4.easeOut',
    duration: 4,
  });

  if (lastCategory) {
    gsap.to(arrow.rotation, {
      x: -1.5 + mousePerspectiveY * 0.2,
      y: mousePerspectiveX * 0.8,
      ease: 'Power4.easeOut',
      duration: 4,
    });
  }
}
