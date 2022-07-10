import { PerspectiveCamera, Raycaster, Vector2 } from 'three';
import { sizes } from './renderer';

export const CAMERA_POSITION = 800;
const FOV = (180 * (2 * Math.atan(sizes.height / 2 / CAMERA_POSITION))) / Math.PI;

export const camera = new PerspectiveCamera(FOV, sizes.width / sizes.height, 1);
camera.position.set(0, 2000, CAMERA_POSITION);

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.fov = (180 * (2 * Math.atan(sizes.height / 2 / camera.position.z))) / Math.PI;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
});

export const raycaster = new Raycaster();
raycaster.far = camera.far;
raycaster.near = camera.near;

export const mouse = new Vector2();
export const mousePerspective = new Vector2();
