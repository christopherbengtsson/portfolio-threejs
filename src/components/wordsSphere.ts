import { Group, Mesh, Vector3 } from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { Font } from 'three/examples/jsm/loaders/FontLoader';
import { camera } from '../core/threejs/camera';
import { textMaterial } from '../core/threejs/materials';
import { ITexturesAndFonts } from '../types';

const WORDS = [
  'REACT',
  'JAVASCRIPT',
  'NODE',
  'EXPRESS',
  'ES6',
  'HTML',
  'CSS',
  'VANILLA',
  'MICROFRONTENDS',
  'MICROSERVICES',
  'GIT',
  'GITHUB',
  'FRONTEND',
];

const radius = 140;
const count = 6;

export function createWordsSphere(texturesAndFonts: ITexturesAndFonts) {
  const group = new Group();
  const phiSpan = Math.PI / (count + 1);
  const thetaSpan = (Math.PI * 2) / count;
  const { fonts } = texturesAndFonts;
  const font = fonts['Roboto'];

  for (let i = 1; i < count + 1; i++) {
    for (let j = 0; j < count; j++) {
      const position = new Vector3().setFromSphericalCoords(radius, phiSpan * i, thetaSpan * j);
      const word = WORDS.sort((_a, _b) => 0.5 - Math.random())[j];
      group.add(getWord(position, word, font));
    }
  }

  return group;
}

function getWord(pos: Vector3, word: string, font: Font) {
  const textGeometry = new TextGeometry(word, {
    font,
    size: 12,
    height: 0,
    curveSegments: 5,
  });

  const text = new Mesh(textGeometry, textMaterial);
  text.position.set(pos.x, pos.y, pos.z);
  text.quaternion.copy(camera.quaternion);

  return text;
}
