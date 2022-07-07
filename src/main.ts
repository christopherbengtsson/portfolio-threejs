import './style.css';
import { Font } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import {
  Box3,
  Color,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  Object3D,
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
let allowScrolling = true;
let origGridPos: any;
let updatingPerspective = false;
let activeCategory = 'education';
let categoryPositions: { [key: string]: number } = {};
let remainingCategories = [];

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

const textMaterial = new MeshBasicMaterial({ color: 0x1b42d8, transparent: true });
const textOutlineMaterial = new MeshBasicMaterial({
  color: 0x1b42d8,
  transparent: true,
  wireframe: true,
});

interface IUniform {
  type: string;
  value: number | Color | Texture;
}
interface IItem extends Partial<Object3D<Event>> {
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
const sectionItemsMeshes: any[] = [];

let categoryIndex = 0,
  itemIndexTotal = 0,
  nextCategoryPos = 0;

for (const category in categoriesCommonConfig) {
  categorySections[category] = new Group();

  if (category === 'intro') {
    const introTextGeometry = new TextGeometry('Christopher Bengtsson', {
      font: assets.fonts['Schnyder L'],
      size: 50,
      height: 0,
      curveSegments: 20,
    }).center();

    const intro = new Mesh(introTextGeometry, textMaterial);
    categorySections[category].add(intro);

    const subIntroGeometry = new TextGeometry('PORTFOLIO', {
      font: assets.fonts['Schnyder L'],
      size: 380,
      height: 0,
      curveSegments: 20,
    }).center();

    const subIntroText = new Mesh(subIntroGeometry, textOutlineMaterial);
    subIntroText.position.set(0, 0, -200);
    categorySections[category].add(subIntroText);
  } else {
    const textGeometry = new TextGeometry(categoriesCommonConfig[category].name!, {
      font: assets.fonts['Schnyder L'],
      size: 200,
      height: 0,
      curveSegments: 20,
    }).center();

    const categoryName = new Mesh(textGeometry, textMaterial);
    categoryName.position.set(0, 0, 0);
    categorySections[category].add(categoryName);

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

      const item: IItem = {
        uniforms,
        material,
        geometry,
        mesh,
        origPos,
        active: false,
      };

      item.mesh.onClick = () => handleItemClick(item);

      sectionItems[id + categoryIndex] = item;

      categorySections[category].add(item.mesh);
      sectionItemsMeshes.push(item.mesh);

      itemIndex++;
      itemIndexTotal++;
    }
  }

  const bbox = new Box3().setFromObject(categorySections[category]);

  categorySections[category].position.z = nextCategoryPos;
  categoryPositions[category] = nextCategoryPos + 1100;
  nextCategoryPos += Math.min(bbox.min.z, 0) - (category === 'intro' ? 1300 : 800); // TODO: get from camera?

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
      onComplete: () => {
        allowScrolling = true;
      },
    });

    gsap.to(item.uniforms.progress, {
      value: 0,
      ease: 'Expo.easeInOut',
      duration: 1.5,
    });

    gsap.to(textMaterial, {
      opacity: 1,
      ease: 'Expo.easeInOut',
      duration: 1.5,
      onStart: () => {
        textMaterial.visible = true;
      },
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
    allowScrolling = false;

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
      z: -(categorySections[activeCategory].position.z - -item.mesh.position.z) + 100,
      ease: 'Expo.easeInOut',
      duration: 1.5,
    });

    gsap.to(textMaterial, {
      opacity: 0,
      ease: 'Expo.easeInOut',
      duration: 1.5,
      onComplete: () => {
        textMaterial.visible = false;
      },
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

function changeColours() {
  remainingCategories = Object.keys(categoryPositions).filter((key) => {
    return grid.position.z > -categoryPositions[key]; // TODO: look into detecting if exists in camera
  });

  if (
    remainingCategories[remainingCategories.length - 1] &&
    activeCategory !== remainingCategories[remainingCategories.length - 1]
  ) {
    activeCategory = remainingCategories[remainingCategories.length - 1];

    let bgColor = new Color(categoriesCommonConfig[activeCategory].bgColor);
    let textColor = new Color(categoriesCommonConfig[activeCategory].textColor);
    let tintColor = new Color(categoriesCommonConfig[activeCategory].tintColor);

    gsap.to(scene.fog!.color, {
      r: bgColor.r,
      g: bgColor.g,
      b: bgColor.b,
      ease: 'Power4.easeOut',
      duration: 1,
    });

    gsap.to(scene.background, {
      r: bgColor.r,
      g: bgColor.g,
      b: bgColor.b,
      ease: 'Power4.easeOut',
      duration: 1,
    });

    gsap.to([textMaterial.color, textMaterial.emissive], {
      r: textColor.r,
      g: textColor.g,
      b: textColor.b,
      ease: 'Power4.easeOut',
      duration: 1,
    });

    for (let id in sectionItems) {
      gsap.to(sectionItems[id].uniforms.gradientColor.value as Color, {
        r: tintColor.r,
        g: tintColor.g,
        b: tintColor.b,
        ease: 'Power4.easeOut',
        duration: 1,
      });
    }
  }
}

function mouseDown(e: MouseEvent) {
  e.preventDefault();

  mouse.x = (e.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = -(e.clientY / renderer.domElement.clientHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(sectionItemsMeshes);

  if (intersects.length > 0) {
    intersects[0].object?.onClick();
  }
}

function mouseMove(e: MouseEvent) {
  mouse.x = e.clientX / window.innerWidth - 0.5;
  mouse.y = e.clientY / window.innerHeight - 0.5;
  updatingPerspective = true;
}

function scroll(ev: WheelEvent) {
  const delta = normalizeWheelDelta(ev);

  scrollPos += -delta * 20;
  scrolling = true;

  function normalizeWheelDelta(e: WheelEvent) {
    if (e.detail) {
      if (e.deltaY) return (e.deltaY / e.detail / 40) * (e.detail > 0 ? 1 : -1);
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
  if (allowScrolling && scrolling) {
    const delta = (scrollPos - grid.position.z) / 12;
    grid.position.z += delta;

    changeColours();

    if (Math.abs(delta) > 0.1) {
      scrolling = true;
    } else {
      scrolling = false;
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
