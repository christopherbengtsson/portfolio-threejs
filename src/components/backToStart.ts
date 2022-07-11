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
import woosh from '../../assets/whoooosh.png';
import arrowdown from '../../assets/arrowdown.png';

export function createBackToStartBtn() {
  const backToStart = new Group();
  backToStart.name = 'backToStart';

  let backToStartTexture = new TextureLoader().load(woosh);
  backToStartTexture.magFilter = backToStartTexture.minFilter = LinearFilter;
  let backToStartMaterial = new MeshBasicMaterial({
    map: backToStartTexture,
    transparent: true,
    depthWrite: false,
  });
  let backToStartGeom = new PlaneGeometry(1, 1);
  const circle = new Mesh(backToStartGeom, backToStartMaterial);
  circle.name = 'circle';
  circle.scale.set(200, 200, 1);
  backToStart.add(circle);

  let texture = new TextureLoader().load(arrowdown);
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  texture.magFilter = texture.minFilter = LinearFilter;
  let material = new MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: DoubleSide,
    depthWrite: false,
  });
  let geom = new PlaneGeometry(1, 1);
  const arrow = new Mesh(geom, material);
  arrow.name = 'arrow';
  arrow.scale.set(90, 90, 1);
  arrow.position.z = 20;
  backToStart.add(arrow);

  backToStart.position.set(0, -450, 50);
  if (sizes.width < 600) backToStart.scale.set(1.5, 1.5, 1);

  backToStart.userData = {
    bajs: true,
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
