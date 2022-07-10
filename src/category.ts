import { Mesh } from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { textMaterial, textOutlineMaterial } from './core/materials';
import { ITexturesAndFonts } from './types';
import { categoriesCommonConfig } from './utils/categoriesCommonConfig';

export function createIntroSection({ fonts }: ITexturesAndFonts) {
  const introSmallTextGeometry = new TextGeometry('Christopher Bengtsson', {
    font: fonts['Roboto'],
    size: 60,
    height: 0,
    curveSegments: 10,
  }).center();

  const intro = new Mesh(introSmallTextGeometry, textMaterial);

  const introBigTextGeometry = new TextGeometry('1337', {
    font: fonts['Roboto'],
    size: 640,
    height: 0,
    curveSegments: 4,
  }).center();

  const subIntroText = new Mesh(introBigTextGeometry, textOutlineMaterial);
  subIntroText.position.set(0, 0, -500);

  return [intro, subIntroText];
}
export function createEndSection({ fonts }: ITexturesAndFonts) {
  const endTextGeometry = new TextGeometry("Yep, that's it", {
    font: fonts['Roboto'],
    size: 200,
    height: 0,
    curveSegments: 4,
  }).center();

  const endText = new Mesh(endTextGeometry, textOutlineMaterial);
  endText.position.set(0, 0, -300);

  return [endText];
}
export function createGenericSection(category: string, { fonts }: ITexturesAndFonts) {
  const textGeometry = new TextGeometry(categoriesCommonConfig[category].name!, {
    font: fonts['Roboto'],
    size: 200,
    height: 0,
    curveSegments: 10,
  }).center();

  const categoryName = new Mesh(textGeometry, textMaterial);
  categoryName.position.set(0, 0, 0);

  return [categoryName];
}
