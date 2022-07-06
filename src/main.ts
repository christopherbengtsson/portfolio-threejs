import './style.css';
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import {
   Color,
   Group,
   Mesh,
   MeshPhongMaterial,
   PlaneGeometry,
   ShaderMaterial,
   Texture,
   TextureLoader,
   Vector2,
} from 'three';
import gsap from 'gsap';

import { renderer, scene } from './core/renderer';
import { camera, mouse, raycaster } from './core/camera';

import vert from './shaders/default.vert';
import frag from './shaders/item.frag';

import { generateConfig } from './utils/generateConfig';

let scrolling: boolean;
let scrollPos: number;
let origGridPos: any;
let updatingPerspective = false;
let colourChanged = false;

let assets: {
   textures: { [key: string]: Texture };
   fonts: { [key: string]: Font };
} = {
   textures: {},
   fonts: {},
};
let categoryData = generateConfig();

const assetLoadPromises: Promise<Texture | Font>[] = [];

const imageLoader = new TextureLoader();
imageLoader.crossOrigin = '';

for (const category in categoryData) {
   categoryData[category].data.forEach(({ filename, ...data }) => {
      assetLoadPromises.push(
         new Promise((resolve) => {
            imageLoader.load(`assets/${category}/${filename}`, (texture) => {
               texture.name = filename;
               resolve(texture);
            });
         }),
      );
   });
}

const fontLoader = new FontLoader();
const fonts = ['fonts/schnyder.json']; // TODO

for (const font of fonts) {
   assetLoadPromises.push(
      new Promise((resolve) => fontLoader.load(font, (font) => resolve(font))),
   );
}

const _assets = await Promise.all(assetLoadPromises);

_assets.forEach((asset) => {
   if ((asset as Texture).image) {
      assets.textures[(asset as Texture).name] = asset as Texture;
   } else {
      assets.fonts[(asset as any).data.familyName] = asset as Font; // TODO any
   }
});

document.body.appendChild(renderer.domElement);

const grid = new Group();
scene.add(grid);

const textMaterial = new MeshPhongMaterial({
   color: 0x1b42d8,
   emissive: 0x1b42d8,
});

const textGeometry = new TextGeometry('Education', {
   font: assets.fonts['Schnyder L'],
   size: 200,
   height: 0,
   curveSegments: 20,
}).center();
const text = new Mesh(textGeometry, textMaterial);
text.position.set(-5, 0, -550);

grid.add(text);

const textGeometry2 = new TextGeometry('Experience', {
   font: assets.fonts['Schnyder L'],
   size: 200,
   height: 0,
   curveSegments: 20,
}).center();
const text2 = new Mesh(textGeometry2, textMaterial);
text2.position.set(140, 0, -2850);

grid.add(text2);

interface IUniform {
   type: string;
   value: number | Color | Texture;
}
interface IItem {
   geometry: PlaneGeometry;
   material: ShaderMaterial;
   mesh: Mesh;
   origPos: Vector2;
   uniforms: {
      time: IUniform;
      fogColor: IUniform;
      fogNear: IUniform;
      fogFar: IUniform;
      _texture: IUniform;
      opacity: IUniform;
      progress: IUniform;
      gradientColor: IUniform;
   };
   active: boolean;
}

const items: IItem[] = [];
let i = 0;

for (let id in assets.textures) {
   const uniforms = {
      time: { type: 'f', value: 1.0 },
      fogColor: { type: 'c', value: scene.fog!.color },
      fogNear: { type: 'f', value: scene.fog!.near },
      fogFar: { type: 'f', value: scene.fog!.far },
      _texture: { type: 't', value: assets.textures[id] },
      opacity: { type: 'f', value: 1.0 },
      progress: { type: 'f', value: 0.0 },
      gradientColor: { type: 'vec3', value: new Color(0x1b42d8) },
   };

   const geometry = new PlaneGeometry(1, 1);
   const material = new ShaderMaterial({
      uniforms,
      fragmentShader: frag,
      vertexShader: vert,
      fog: true,
      transparent: true,
   });

   const mesh = new Mesh(geometry, material);
   mesh.scale.set(400, 300, 1);

   const align = i % 4;
   const pos = new Vector2();

   if (align === 0) pos.set(-350, 350); // bottom left
   if (align === 1) pos.set(350, 350); // bottom right
   if (align === 2) pos.set(350, -350); // top right
   if (align === 3) pos.set(-350, -350); // top left

   mesh.position.set(pos.x, pos.y, i * -300);
   const origPos = new Vector2(pos.x, pos.y);

   const item: IItem = {
      geometry,
      material,
      mesh,
      uniforms,
      origPos,
      active: false,
   };

   mesh.onClick = () => handleItemClick(item);

   (items[id as any] as any) = item;
   grid.add(item.mesh);

   i++;
}
console.log(items);

function handleItemClick(item) {
   if (item.active) {
      item.active = false;

      gsap.to(item.mesh.position, {
         x: item.origPos.x,
         y: item.origPos.y,
         ease: 'Expo.easeInOut',
         duration: 1.5,
      });

      gsap.to(grid.position, {
         z: origGridPos,
         ease: 'Expo.easeInOut',
         duration: 1.5,
      });

      gsap.to(item.uniforms.progress, {
         value: 0,
         ease: 'Expo.easeInOut',
         duration: 1.5,
      });

      for (let x in items) {
         if (items[x].active) continue;

         gsap.to(items[x].material.uniforms.opacity, {
            value: 1,
            ease: 'Expo.easeInOut',
            duration: 1.5,
         });
      }
   } else {
      item.active = true;
      origGridPos = grid.position.z;

      gsap.to(item.mesh.position, {
         x: 0,
         y: 0,
         ease: 'Expo.easeInOut',
         duration: 1.5,
      });

      gsap.to(item.uniforms.progress, {
         value: 1,
         ease: 'Expo.easeInOut',
         duration: 1.5,
      });

      gsap.to(grid.position, {
         z: -item.mesh.position.z + 200,
         ease: 'Expo.easeInOut',
         duration: 1.5,
      });

      for (let x in items) {
         if (items[x].active) continue;

         gsap.to(items[x].material.uniforms.opacity, {
            value: 0,
            ease: 'Expo.easeInOut',
            duration: 1.5,
         });
      }
   }
}

function updatePerspective() {
   gsap.to(camera.rotation, {
      x: -mouse.y * 0.5,
      y: -mouse.x * 0.5,
      ease: 'Power4.easeOut',
      duration: 3,
   });

   updatingPerspective = false;
}

const loop = () => {
   // let elapsedMilliseconds = Date.now() - c.startTime
   // items[0].uniforms.time.value = elapsedMilliseconds / 1000

   if (updatingPerspective) {
      updatePerspective();
      updatingPerspective = false;
   }

   // smooth scrolling
   if (scrolling) {
      let delta = (scrollPos - grid.position.z) / 12;
      grid.position.z += delta;

      if (Math.abs(delta) > 0.1) {
         scrolling = true;
      } else {
         scrolling = false;
      }
   }

   if (grid.position.z > 1300 && !colourChanged) {
      colourChanged = true;

      let targetColor = new Color(0x012534);
      let targetColor2 = new Color(0xfd6f53);

      gsap.to(scene.fog!.color, {
         r: targetColor.r,
         g: targetColor.g,
         b: targetColor.b,
         ease: 'Expo.easeInOut',
         duration: 3,
      });

      gsap.to(scene.background, {
         r: targetColor.r,
         g: targetColor.g,
         b: targetColor.b,
         ease: 'Expo.easeInOut',
         duration: 3,
      });

      gsap.to([textMaterial.color, textMaterial.emissive], {
         r: targetColor2.r,
         g: targetColor2.g,
         b: targetColor2.b,
         ease: 'Expo.easeInOut',
         duration: 3,
      });

      for (let id in items) {
         const item = items[id];

         gsap.to(item.uniforms.gradientColor.value as Color, {
            r: targetColor.r,
            g: targetColor.g,
            b: targetColor.b,
            ease: 'Expo.easeInOut',
            duration: 3,
         });
      }
   }

   renderer.render(scene, camera);
   requestAnimationFrame(loop);
};

function mouseDown(e: MouseEvent) {
   e.preventDefault();

   mouse.x = (e.clientX / renderer.domElement.clientWidth) * 2 - 1;
   mouse.y = -(e.clientY / renderer.domElement.clientHeight) * 2 + 1;

   raycaster.setFromCamera(mouse, camera);

   const intersects = raycaster.intersectObjects(grid.children);

   if (intersects.length > 0) {
      intersects[0].object.onClick();
   }
}

function mouseMove(e: MouseEvent) {
   mouse.x = e.clientX / window.innerWidth - 0.5;
   mouse.y = e.clientY / window.innerHeight - 0.5;
   updatingPerspective = true;
}
function initListeners() {
   addEventListener('mousemove', mouseMove);
   //    addEventListener('touchmove', mouseMove);
   addEventListener('mousedown', mouseDown);

   renderer.domElement.addEventListener('wheel', (e) => {
      gsap.set(grid.position, {
         z: '+=' + e.deltaY,
         ease: 'Power4.easeOut',
      });
   });
}

loop();
initListeners();
