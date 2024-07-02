import { Color, Group, Mesh, MeshPhongMaterial, SpotLight, TorusKnotGeometry } from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { textMaterial, textOutlineMaterial } from '../core/threejs/materials';
import { ITexturesAndFonts } from '../types';
import { categoriesCommonConfig, initialColor } from '../utils/categoriesCommonConfig';
import { createBackToStartBtn } from './backToStart';

export function createIntroSection({ fonts }: ITexturesAndFonts) {
  const introBigTextGeometry = new TextGeometry('Christopher Bengtsson', {
    font: fonts['Roboto'],
    size: 80,
    height: 0,
    curveSegments: 10,
  }).center();

  const introText = new Mesh(introBigTextGeometry, textMaterial);

  const introSmallTextGeometry = new TextGeometry('"portfolio"', {
    font: fonts['Roboto'],
    size: 60,
    height: 0,
    curveSegments: 4,
  }).center();

  const subIntroText = new Mesh(introSmallTextGeometry, textOutlineMaterial);
  subIntroText.position.set(0, -100, -150);

  const torusGroup = new Group();
  const geometry = new TorusKnotGeometry(500, 100, 400, 200);
  const material = new MeshPhongMaterial({ color: initialColor, transparent: true, opacity: 0 });
  const torusKnot = new Mesh(geometry, material);
  torusKnot.position.set(0, 0, -500);

  const upperLight = new SpotLight(new Color(), 100_000);
  upperLight.position.set(0, 200, -700);

  const lowerLight = new SpotLight(new Color(), 100_000);
  lowerLight.position.set(0, -200, -200);

  const rightLight = new SpotLight(new Color(), 100_000);
  rightLight.position.set(200, -0, -500);

  torusGroup.add(torusKnot, upperLight, lowerLight, rightLight);

  return [introText, subIntroText, torusGroup];
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

  const backToStartBtn = createBackToStartBtn();

  return [endText, backToStartBtn];
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
