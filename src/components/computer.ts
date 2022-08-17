import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Color, Group, Mesh, Object3D, PointLight } from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import gsap from 'gsap';
import { initialColor } from '../utils/categoriesCommonConfig';

export let sceneGroup: Group;
let computerOpen = false;
const SCRREN_CLOSED_POSITION = 1.575;
const SCRREN_OPENED_POSITION = -0.225;

export function createComputer(sectionItemsMeshes: Mesh[], callback) {
  const loader = new GLTFLoader();

  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('src/utils/decoder/');
  loader.setDRACOLoader(dracoLoader);

  loader.load(
    '/mac-draco._1glb.glb',
    function (gltf) {
      sceneGroup = gltf.scene;
      sceneGroup.position.set(0, 500, 0);
      sceneGroup.rotateX(0.15);
      console.log(sceneGroup.position);

      const light = new PointLight(new Color(initialColor), 1.5);
      light.position.set(0, 800, 50);
      sceneGroup.add(light);

      const screenflip = sceneGroup.getObjectByName('screenflip') as Object3D<Event>;
      screenflip.rotation.set(SCRREN_CLOSED_POSITION, 0, 0);

      const meshes: Mesh[] = [];
      let screen;
      sceneGroup.traverse((child) => {
        const mesh = child as Mesh;
        if (mesh.isMesh) {
          mesh.onClick = () => animateComputer(sceneGroup, screenflip);
          meshes.push(mesh);
        }
        if (mesh.name === 'Cube008') {
          screen = new Mesh(mesh.geometry);
        }
      });
      sectionItemsMeshes.push(...meshes);

      callback(sceneGroup);
    },
    // called while loading is progressing
    function (xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
    },
    // called when loading has errors
    function (error) {
      console.log('An error happened', error);
    }
  );
}

export function showComputer() {
  gsap.to(sceneGroup.position, {
    y: 0,
    delay: 1.5,
    duration: 1.5,
    ease: 'bounce.out',
  });
}

function animateComputer(sceneGroup: Group, screenflip: Object3D<Event>) {
  gsap.to(screenflip.rotation, {
    x: computerOpen ? SCRREN_CLOSED_POSITION : SCRREN_OPENED_POSITION,
    duration: 1.3,
    ease: computerOpen ? 'power4.out' : 'power4.in',
    onComplete: () => {
      computerOpen = !computerOpen;
    },
  });

  // gsap.to(sceneGroup.rotation, {
  //   x: computerOpen ? 0.15 : 0.5,
  //   duration: 1.3,
  // });

  gsap.to(sceneGroup.position, {
    y: computerOpen ? 0 : -215,
    duration: 1.3,
  });
}
