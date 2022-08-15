import { Group } from 'three';
import gsap from 'gsap';
import {
  captionTextMaterial,
  linkUnderlineMaterial,
  textMaterial,
} from '../core/threejs/materials';
import { IItem } from '../types';

export function animateItemClose(
  itemOpen: IItem,
  grid: Group,
  origGridPos: number,
  sectionItems: { [key: string]: IItem },
  onGridScrollComplete: () => void,
  onMaterialsOpacityComplete: () => void
) {
  gsap.to(itemOpen.meshGroup.rotation, {
    y: 0,
    ease: 'Expo.easeInOut',
    duration: 0.5,
  });

  gsap.to(itemOpen.group.position, {
    x: itemOpen.origPos.x,
    y: itemOpen.origPos.y,
    ease: 'Expo.easeInOut',
    duration: 1.5,
  });

  gsap.to(grid.position, {
    z: origGridPos,
    ease: 'Expo.easeInOut',
    duration: 1.5,
    onComplete: onGridScrollComplete,
  });

  gsap.to(itemOpen.uniforms.progress, {
    value: 0,
    ease: 'Expo.easeInOut',
    duration: 1.5,
  });

  gsap.to(textMaterial, {
    opacity: 1,
    ease: 'Expo.easeInOut',
    duration: 1.5,
    onStart: () => {
      textMaterial.visible = true;
    },
  });

  gsap.to([captionTextMaterial, linkUnderlineMaterial], {
    opacity: 0,
    ease: 'Expo.easeInOut',
    duration: 1,
    onComplete: onMaterialsOpacityComplete,
  });

  for (const itemKey in sectionItems) {
    if (sectionItems[itemKey].active) continue;

    gsap.to(sectionItems[itemKey].material.uniforms.opacity, {
      value: 1,
      ease: 'Expo.easeInOut',
      duration: 1.5,
    });

    gsap.to(sectionItems[itemKey].group.position, {
      x: sectionItems[itemKey].origPos.x,
      y: sectionItems[itemKey].origPos.y,
      ease: 'Expo.easeInOut',
      duration: 1.5,
    });
  }
}
