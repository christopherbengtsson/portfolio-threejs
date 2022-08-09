import { Group, Vector2 } from 'three';
import gsap from 'gsap';
import {
  captionTextMaterial,
  linkUnderlineMaterial,
  textMaterial,
} from '../core/threejs/materials';
import { scale } from '../core/threejs/renderer';
import { IItem } from '../types';

export function animateItemOpen(
  item: IItem,
  onComplete: () => void,
  posOffset: number,
  grid: Group,
  sectionItems: { [key: string]: IItem }
) {
  gsap.to(item.group.position, {
    x: 0,
    y: 0,
    ease: 'Expo.easeInOut',
    duration: 1.5,
    onComplete: item.meshGroup.children.length === 1 ? onComplete : () => {},
  });

  if (item.meshGroup.children.length > 1) {
    gsap.to(item.meshGroup.rotation, {
      y: 3.15,
      delay: 1.4,
      ease: 'Expo.easeInOut',
      duration: 1,
      onComplete,
    });
  }

  gsap.to(item.uniforms.progress, {
    value: 1,
    ease: 'Expo.easeInOut',
    duration: 1.5,
  });

  gsap.to(grid.position, {
    z: -(posOffset - -item.group.position.z) + (scale < 0.5 ? 450 : 300),
    ease: 'Expo.easeInOut',
    duration: 1.5,
  });

  gsap.to(textMaterial, {
    opacity: 0,
    ease: 'Expo.easeInOut',
    duration: 1,
    onComplete: () => {
      textMaterial.visible = false;
    },
  });

  gsap.to(captionTextMaterial, {
    delay: 0.3,
    opacity: 1,
    ease: 'Expo.easeInOut',
    duration: 2,
    onStart: () => {
      captionTextMaterial.visible = true;
    },
  });

  gsap.to(linkUnderlineMaterial, {
    opacity: 0.4,
    ease: 'Expo.easeInOut',
    delay: 0.3,
    duration: 2,
    onStart: () => {
      linkUnderlineMaterial.visible = true;
    },
  });

  if (item.caption) {
    gsap.fromTo(
      item.caption.position,
      { z: -100 },
      {
        z: 0,
        delay: 0.2,
        ease: 'Expo.easeInOut',
        duration: 2,
        onStart: () => {
          item.caption!.visible = true;
        },
      }
    );
  }

  if (item.linkGroup) {
    gsap.fromTo(
      item.linkGroup.position,
      { z: -100 },
      {
        z: 0,
        delay: 0.3,
        ease: 'Expo.easeInOut',
        duration: 2,
        onStart: () => {
          item.linkGroup!.visible = true;
        },
      }
    );
  }

  const position = new Vector2();

  for (let itemKey in sectionItems) {
    if (sectionItems[itemKey].align === 0) position.set(-700, 700); // bottom left
    if (sectionItems[itemKey].align === 1) position.set(700, 700); // bottom right
    if (sectionItems[itemKey].align === 2) position.set(700, -700); // top right
    if (sectionItems[itemKey].align === 3) position.set(-700, -700); // top left

    if (sectionItems[itemKey] === item) continue;

    gsap.to(sectionItems[itemKey].material.uniforms.opacity, {
      value: 0,
      ease: 'Expo.easeInOut',
      duration: 1.3,
    });

    gsap.to(sectionItems[itemKey].group.position, {
      x: position.x,
      y: position.y,
      ease: 'Expo.easeInOut',
      duration: 1.3,
    });
  }
}
