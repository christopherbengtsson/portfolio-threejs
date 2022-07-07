import { PerspectiveCamera, Raycaster, Vector2 } from 'three';
import { scene, sizes } from './renderer';

const CAMERA_POSITION = 900;
const FOV = (180 * (2 * Math.atan(sizes.height / 2 / CAMERA_POSITION))) / Math.PI;

export const camera = new PerspectiveCamera(FOV, sizes.width / sizes.height, 1);
camera.lookAt(scene.position);
camera.position.z = CAMERA_POSITION;

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
