import { Color } from 'three';
import gsap from 'gsap';
import { cursorSvgs, mainSvgs } from '../core/dom';
import {
  captionTextMaterial,
  linkUnderlineMaterial,
  textMaterial,
  textOutlineMaterial,
} from '../core/threejs/materials';
import { scene } from '../core/threejs/renderer';
import { IItem } from '../types';

export function animateColors(
  bgColor: Color,
  textColor: Color,
  tintColor: Color,
  activeCategoryOutlineColor: number | undefined,
  sectionItems: { [key: string]: IItem }
) {
  gsap.to(scene.fog!.color, {
    r: bgColor.r,
    g: bgColor.g,
    b: bgColor.b,
    ease: 'Power4.easeOut',
    duration: 1,
  });

  gsap.to(scene.background, {
    r: bgColor.r,
    g: bgColor.g,
    b: bgColor.b,
    ease: 'Power4.easeOut',
    duration: 1,
  });

  gsap.to(textMaterial.color, {
    r: textColor.r,
    g: textColor.g,
    b: textColor.b,
    ease: 'Power4.easeOut',
    duration: 1,
  });

  gsap.set([captionTextMaterial.color, linkUnderlineMaterial.color], {
    r: textColor.r,
    g: textColor.g,
    b: textColor.b,
  });

  for (let id in sectionItems) {
    gsap.to(sectionItems[id].uniforms.gradientColor.value as Color, {
      r: tintColor.r,
      g: tintColor.g,
      b: tintColor.b,
      ease: 'Power4.easeOut',
      duration: 1,
    });
  }

  let interfaceColor: string;
  if (activeCategoryOutlineColor) {
    const outlineTextColor = new Color(activeCategoryOutlineColor);
    interfaceColor = outlineTextColor.getHexString();

    gsap.to([textOutlineMaterial.color], {
      r: outlineTextColor.r,
      g: outlineTextColor.g,
      b: outlineTextColor.b,
      ease: 'Power4.easeOut',
      duration: 1,
    });
  } else {
    interfaceColor = textColor.getHexString();
  }

  gsap.to(mainSvgs, { fill: `#${interfaceColor}`, ease: 'Power4.easeOut', duration: 1 });
  gsap.to(cursorSvgs, { stroke: `#${interfaceColor}`, ease: 'Power4.easeOut', duration: 1 });
}
