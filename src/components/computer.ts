import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Group, Mesh } from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { scene } from '../core/threejs/renderer';

export function createComputer() {
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('src/utils/decoder/');
  loader.setDRACOLoader(dracoLoader);
  let materials: GLTF;

  //   const dracoLoader = new DRACOLoader();
  //   dracoLoader.setDecoderPath('/examples/js/libs/draco/');
  //   loader.setDRACOLoader(dracoLoader);
  loader.load(
    // resource URL
    '/mac-draco.glb',
    // called when the resource is loaded
    function (gltf) {
      const sceneGroup = gltf.scene;
      console.log(sceneGroup);

      const screenflip = sceneGroup.children.find(({ name }) => name === 'screenflip');
      const base = sceneGroup.children.find(({ name }) => name === 'base');
      const keyboard = sceneGroup.children.find(({ name }) => name === 'keyboard');
      const touchbar = sceneGroup.children.find(({ name }) => name === 'touchbar');

      const [Cube002, Cube002_01] = base!.children;
      const [Cube008, Cube008_1, Cube008_2] = screenflip!.children[0].children;

      const group = new Group();
      group.position.set(0, -0.04, 0.41);
      group.scale.set(100, 100, 100);

      const someGroup = new Group();
      someGroup.position.set(0, 2.96, -0.13);
      const aluminium = new Mesh((Cube008 as Mesh).geometry, (Cube008 as Mesh).material);
      const matte = new Mesh((Cube008_1 as Mesh).geometry, (Cube008_1 as Mesh).material);
      const screen = new Mesh((Cube008_2 as Mesh).geometry, (Cube008_2 as Mesh).material);

      someGroup.add(aluminium, matte, screen);
      group.add(someGroup);

      const keys = new Mesh((keyboard as Mesh).geometry, (keyboard as Mesh).material);
      keys.position.set(1.79, 0, 3.45);
      group.add(keys);

      const keyboardGroup = new Group();
      keyboardGroup.position.set(0, -0.1, 3.39);
      keyboardGroup.add(new Mesh((Cube002 as Mesh).geometry, (Cube002 as Mesh).material)); // alu
      keyboardGroup.add(new Mesh((Cube002_01 as Mesh).geometry, (Cube002 as Mesh).material)); // trackpad

      group.add(keyboardGroup);

      const touchbarMesh = new Mesh((touchbar as Mesh).geometry, (touchbar as Mesh).material);
      touchbarMesh.position.set(0, -0.03, 1.2);
      group.add(touchbarMesh);

      scene.add(group);
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
