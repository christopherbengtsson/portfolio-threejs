import './style.css';
import { Font } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import {
   Box3,
   Color,
   Group,
   Mesh,
   MeshPhongMaterial,
   PlaneGeometry,
   ShaderMaterial,
   Texture,
   Vector2,
} from 'three';
import gsap from 'gsap';

import { mode, renderer, scene, stats } from './core/renderer';
import { camera, mouse, raycaster } from './core/camera';

import vert from './shaders/default.vert';
import frag from './shaders/item.frag';

import { loadAssets } from './utils/assetLoader';
import { categoriesCommonConfig } from './utils/categoriesCommonConfig';

let scrolling: boolean;
let scrollPos = 0;
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

const _assets = await loadAssets();

_assets.forEach((asset) => {
   if ((asset as Texture).image) {
      assets.textures[(asset as Texture).name] = asset as Texture;
   } else {
      assets.fonts[(asset as any).data.familyName] = asset as Font;
   }
});

document.body.appendChild(renderer.domElement);

const grid = new Group();
scene.add(grid);

const textMaterial = new MeshPhongMaterial({
   color: 0x1b42d8,
   emissive: 0x1b42d8,
});

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

const categorySections: { [key: string]: Group } = {};
const sectionItems: { [key: string]: IItem } = {};

let categoryIndex = 0,
   itemIndexTotal = 0,
   nextCategoryPos = 0;

for (const category in categoriesCommonConfig) {
   categorySections[category] = new Group();

   const textGeometry = new TextGeometry(
      categoriesCommonConfig[category].name,
      {
         font: assets.fonts['Schnyder L'],
         size: 200,
         height: 0,
         curveSegments: 20,
      },
   ).center();

   const text = new Mesh(textGeometry, textMaterial);

   let itemIndex = 0;

   for (const id in assets.textures) {
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
      mesh.scale.set(assets.textures[id].size.x, assets.textures[id].size.y, 1);
      // mesh.scale.set(400, 300, 1);

      const align = itemIndexTotal % 4;
      const pos = new Vector2();

      if (align === 0) pos.set(-350, 350); // bottom left
      if (align === 1) pos.set(350, 350); // bottom right
      if (align === 2) pos.set(350, -350); // top right
      if (align === 3) pos.set(-350, -350); // top left

      mesh.position.set(pos.x, pos.y, itemIndex * -300);
      const origPos = new Vector2(pos.x, pos.y);

      const item = {
         uniforms,
         material,
         geometry,
         mesh,
         origPos,
         active: false,
      };

      item.mesh.onClick = () => handleItemClick(item);

      sectionItems[id + categoryIndex] = item;
      categorySections[category].add(mesh);

      itemIndex++;
      itemIndexTotal++;
   }

   const bbox = new Box3().setFromObject(categorySections[category]);

   text.position.set(-5, 0, bbox.min.z);
   categorySections[category].add(text);

   categorySections[category].position.z = nextCategoryPos;
   nextCategoryPos += bbox.min.z - 450; // TODO: get from camera?

   categoryIndex++;

   grid.add(categorySections[category]);
}
console.log(categorySections);
console.log(sectionItems);

function handleItemClick(item: IItem) {
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

      for (const itemKey in sectionItems) {
         if (sectionItems[itemKey].active) continue;

         gsap.to(sectionItems[itemKey].material.uniforms.opacity, {
            value: 1,
            ease: 'Expo.easeInOut',
            duration: 1.5,
         });
      }
   } else {
      // TODO: Repetitive code
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

      for (let itemKey in sectionItems) {
         if (sectionItems[itemKey].active) continue;

         gsap.to(sectionItems[itemKey].material.uniforms.opacity, {
            value: 0,
            ease: 'Expo.easeInOut',
            duration: 1.5,
         });
      }
   }
}

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

function scroll(ev: WheelEvent) {
   const delta = normalizeWheelDelta(ev);

   scrollPos += -delta * 30;
   scrolling = true;

   function normalizeWheelDelta(e: WheelEvent) {
      if (e.detail) {
         if (e.deltaY)
            return (e.deltaY / e.detail / 40) * (e.detail > 0 ? 1 : -1);
         // Opera
         else return -e.detail / 3; // Firefox
      } else return e.deltaY / 120; // IE,Safari,Chrome
   }
}

function initListeners() {
   addEventListener('mousemove', mouseMove);
   //    addEventListener('touchmove', mouseMove);
   addEventListener('mousedown', mouseDown);

   renderer.domElement.addEventListener('wheel', scroll);
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
   if (updatingPerspective) {
      updatePerspective();
      updatingPerspective = false;
   }

   // smooth scrolling
   if (scrolling) {
      const delta = (scrollPos - grid.position.z) / 12;
      grid.position.z += delta;

      if (Math.abs(delta) > 0.1) {
         scrolling = true;
      } else {
         scrolling = false;
      }
   }

   if (grid.position.z > 1300 && !colourChanged) {
      colourChanged = true;

      const targetColor = new Color(0x012534);
      const targetColor2 = new Color(0xfd6f53);

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

      for (let sectionItemKey in sectionItems) {
         const item = sectionItems[sectionItemKey];

         gsap.to(item.uniforms.gradientColor.value as Color, {
            r: targetColor.r,
            g: targetColor.g,
            b: targetColor.b,
            ease: 'Expo.easeInOut',
            duration: 3,
         });
      }
   }

   if (mode === 'development') {
      stats.update();
   }

   renderer.render(scene, camera);
   requestAnimationFrame(loop);
};

loop();
initListeners();
