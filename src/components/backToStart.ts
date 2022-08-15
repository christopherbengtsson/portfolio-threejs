import {
  DoubleSide,
  Group,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  TextureLoader,
} from 'three';
import { renderer, sizes } from '../core/threejs/renderer';
import gsap from 'gsap';
import woosh from '../../assets/goback.svg';
import arrowdown from '../../assets/arrowdown.svg';
import { categoriesCommonConfig } from '../utils/categoriesCommonConfig';

export function createBackToStartBtn() {
  const backToStart = new Group();
  backToStart.name = 'backToStart';

  const circle = createBackToStartCircle();
  backToStart.add(circle);

  const arrow = createArrow();
  backToStart.add(arrow);

  backToStart.position.set(0, -450, 50);
  if (sizes.width < 600) backToStart.scale.set(1.5, 1.5, 1);

  backToStart.userData = {
    arrowGsap: gsap.to(arrow.position, {
      z: 0,
      repeat: -1,
      yoyo: true,
      ease: 'Power2.easeInOut',
      duration: 1,
    }),
  };

  return backToStart;
}

function createBackToStartCircle() {
  const backToStartTexture = new TextureLoader().load(woosh);
  backToStartTexture.magFilter = backToStartTexture.minFilter = LinearFilter;

  const backToStartMaterial = new MeshBasicMaterial({
    map: backToStartTexture,
    transparent: true,
    depthWrite: false,
    color: categoriesCommonConfig.end.textColor,
  });

  const backToStartGeometry = new PlaneGeometry(1, 1);
  const circle = new Mesh(backToStartGeometry, backToStartMaterial);
  circle.name = 'circle';
  circle.scale.set(200, 200, 1);

  return circle;
}

function createArrow() {
  const arrowTexture = new TextureLoader().load(arrowdown);
  arrowTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  arrowTexture.magFilter = arrowTexture.minFilter = LinearFilter;

  const arrowMaterial = new MeshBasicMaterial({
    map: arrowTexture,
    transparent: true,
    side: DoubleSide,
    depthWrite: false,
    color: categoriesCommonConfig.end.outlineTextColor,
  });
  const arrowGeometry = new PlaneGeometry(1, 1);
  const arrow = new Mesh(arrowGeometry, arrowMaterial);
  arrow.name = 'arrow';
  arrow.scale.set(90, 90, 1);
  arrow.position.z = 20;

  return arrow;
}
