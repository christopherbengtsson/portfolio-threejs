import './style.scss';
import { Font } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import {
  Box3,
  Color,
  Fog,
  Group,
  Intersection,
  Mesh,
  MeshBasicMaterial,
  PlaneBufferGeometry,
  PlaneGeometry,
  ShaderMaterial,
  Texture,
  Vector2,
} from 'three';
import gsap from 'gsap';
import CSSRulePlugin from 'gsap/CSSRulePlugin';
import TinyGesture from 'tinygesture';

import { mode, renderer, scene, stats } from './core/renderer';
import { camera, CAMERA_POSITION, mouse, mousePerspective, raycaster } from './core/camera';
import {
  textMaterial,
  textOutlineMaterial,
  captionTextMaterial,
  linkUnderlineMaterial,
} from './core/materials';

import { loadAssets } from './utils/assetLoader';
import { categoriesCommonConfig } from './utils/categoriesCommonConfig';
import { cursor } from './core/dom';
import { generateConfig } from './utils/generateConfig';
import { IItem, IObject3D, ITexturesAndFonts } from './types';
import { createEndSection, createGenericSection, createIntroSection } from './category';
import { createSectionItems } from './sectionItems';

gsap.registerPlugin(CSSRulePlugin);

let controls = {
  holdingMouseDown: false,
  autoMoveSpeed: 0,
};
let scrolling: boolean;
let scrollPos = 0;
let allowScrolling = true;
let stopScrollPos: number;
let itemOpen: any = null;
let itemAnimating = false;
let origGridPos: any;
let updatingPerspective = false;
let activeCategory = 'education';
let remainingCategories: string[] = [];
let intersects: Intersection<IObject3D>[] = [];
let linkIntersect: Intersection<IObject3D>[] = [];

const touchEnabled = 'ontouchstart' in window;
if (touchEnabled) document.documentElement.classList.add('touch-enabled');
const categoryPositions: { [key: string]: number } = {};

const texturesAndFonts: ITexturesAndFonts = {
  textures: {},
  fonts: {},
};

// TODO: Cache assets and timeout for loader
const categoryData = generateConfig();
const _assets = await loadAssets(categoryData);
_assets.forEach((asset) => {
  if ((asset as Texture).image) {
    texturesAndFonts.textures[(asset as Texture).name] = asset as Texture;
  } else {
    texturesAndFonts.fonts[(asset as any).data.familyName] = asset as Font;
  }
});
document.body.appendChild(renderer.domElement);
preventPullToRefresh();

const grid = new Group();
scene.add(grid);

const categorySections: { [key: string]: Group } = {};
const sectionItems: { [key: string]: IItem } = {};
const sectionItemsMeshes: any[] = [];

let itemIndexTotal = 0,
  nextCategoryPos = 0;

for (const category in categoryData) {
  categorySections[category] = new Group();

  if (category === 'intro') {
    categorySections[category].add(...createIntroSection(texturesAndFonts));
  } else if (category === 'end') {
    categorySections[category].add(...createEndSection(texturesAndFonts));
  } else {
    categorySections[category].add(...createGenericSection(category, texturesAndFonts));

    let itemIndex = 0;
    categoryData[category].data.forEach(({ filename, ...data }) => {
      const item = createSectionItems(
        texturesAndFonts,
        category,
        { filename, ...data },
        filename,
        itemIndexTotal,
        itemIndex
      );

      item.mesh.onClick = () => openItem(item);
      sectionItems[filename] = item;

      categorySections[category].add(item.group);
      sectionItemsMeshes.push(item.mesh);

      itemIndex++;
      itemIndexTotal++;
    });
  }

  const bbox = new Box3().setFromObject(categorySections[category]);

  categorySections[category].position.z = nextCategoryPos;
  categoryPositions[category] = nextCategoryPos + 1100;

  let positionOffset = CAMERA_POSITION;
  if (category === 'intro') positionOffset = 1300;
  nextCategoryPos += bbox.min.z - positionOffset;

  grid.add(categorySections[category]);

  if (category === 'end') {
    stopScrollPos = categorySections[category].position.z;
  }
}

function openItem(item: IItem) {
  // TODO: Repetitive code
  itemAnimating = true;
  itemOpen = item;
  origGridPos = grid.position.z;
  allowScrolling = false;

  let posOffset = categorySections[activeCategory].position.z;

  if (item.category !== activeCategory) {
    posOffset = categorySections[remainingCategories[remainingCategories.length - 2]].position.z;
  }

  gsap.to(item.group.position, {
    x: 0,
    y: 0,
    ease: 'Expo.easeInOut',
    onComplete: () => {
      itemAnimating = false;
      cursor.dataset.cursor = 'cross';
    },
    duration: 1.5,
  });

  gsap.to(item.uniforms.progress, {
    value: 1,
    ease: 'Expo.easeInOut',
    duration: 1.5,
  });

  gsap.to(grid.position, {
    z: -(posOffset - -item.group.position.z) + 300,
    ease: 'Expo.easeInOut',
    duration: 1.5,
  });

  gsap.to(textMaterial, {
    opacity: 0,
    ease: 'Expo.easeInOut',
    duration: 1,
    onComplete: () => {
      textMaterial.visible = false;
    },
  });

  gsap.to(captionTextMaterial, {
    delay: 0.3,
    opacity: 1,
    ease: 'Expo.easeInOut',
    duration: 2,
    onStart: () => {
      captionTextMaterial.visible = true;
    },
  });

  gsap.to(linkUnderlineMaterial, {
    opacity: 0.4,
    ease: 'Expo.easeInOut',
    delay: 0.3,
    duration: 2,
    onStart: () => {
      linkUnderlineMaterial.visible = true;
    },
  });

  if (item.caption) {
    gsap.fromTo(
      item.caption.position,
      { z: -100 },
      {
        z: 0,
        delay: 0.2,
        ease: 'Expo.easeInOut',
        duration: 2,
        onStart: () => {
          item.caption!.visible = true;
        },
      }
    );
  }

  if (item.linkGroup) {
    gsap.fromTo(
      item.linkGroup.position,
      { z: -100 },
      {
        z: 0,
        delay: 0.3,
        ease: 'Expo.easeInOut',
        duration: 2,
        onStart: () => {
          item.linkGroup!.visible = true;
        },
      }
    );
  }

  const position = new Vector2();

  for (let itemKey in sectionItems) {
    if (item.align === 0) position.set(-700, 700); // bottom left
    if (item.align === 1) position.set(700, 700); // bottom right
    if (item.align === 2) position.set(700, -700); // top right
    if (item.align === 3) position.set(-700, -700); // top left

    if (sectionItems[itemKey] === item) continue;

    gsap.to(sectionItems[itemKey].material.uniforms.opacity, {
      value: 0,
      ease: 'Expo.easeInOut',
      duration: 1.3,
    });

    gsap.to(sectionItems[itemKey].group.position, {
      x: position.x,
      y: position.y,
      ease: 'Expo.easeInOut',
      duration: 1.3,
    });
  }
}

function closeItem() {
  if (!itemAnimating && itemOpen) {
    itemAnimating = true;
    cursor.dataset.cursor = 'pointer';

    gsap.to(itemOpen.group.position, {
      x: itemOpen.origPos.x,
      y: itemOpen.origPos.y,
      ease: 'Expo.easeInOut',
      duration: 1.5,
    });

    gsap.to(grid.position, {
      z: origGridPos,
      ease: 'Expo.easeInOut',
      duration: 1.5,
      onComplete: () => {
        allowScrolling = true;
        itemOpen = null;
        itemAnimating = false;
      },
    });

    gsap.to(itemOpen.uniforms.progress, {
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

    gsap.to([captionTextMaterial, linkUnderlineMaterial], {
      opacity: 0,
      ease: 'Expo.easeInOut',
      duration: 1,
      onComplete: () => {
        captionTextMaterial.visible = false;
        linkUnderlineMaterial.visible = false;
        if (itemOpen.caption) itemOpen.caption.visible = false;
        if (itemOpen.linkGroup) itemOpen.linkGroup.visible = false;
      },
    });

    for (const itemKey in sectionItems) {
      if (sectionItems[itemKey].active) continue;

      gsap.to(sectionItems[itemKey].material.uniforms.opacity, {
        value: 1,
        ease: 'Expo.easeInOut',
        duration: 1.5,
      });

      gsap.to(sectionItems[itemKey].group.position, {
        x: sectionItems[itemKey].origPos.x,
        y: sectionItems[itemKey].origPos.y,
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
    let svgRule = CSSRulePlugin.getRule('main svg'); // TODO: undefined?
    let svgCursorRule = CSSRulePlugin.getRule('.cursor svg');
    let interfaceColor;

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

    gsap.to([textMaterial.color, captionTextMaterial.color], {
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

    if (categoriesCommonConfig[activeCategory].outlineTextColor) {
      const outlineTextColor = new Color(categoriesCommonConfig[activeCategory].outlineTextColor);
      interfaceColor = outlineTextColor.getHexString();

      gsap.to([textOutlineMaterial.color], {
        r: outlineTextColor.r,
        g: outlineTextColor.g,
        b: outlineTextColor.b,
        ease: 'Power4.easeOut',
        duration: 1,
      });
    } else {
      interfaceColor = textColor.getHexString();
    }

    gsap.to(svgRule, {
      cssRule: { fill: '#' + interfaceColor },
      ease: 'Power4.easeOut',
      duration: 1,
    });
    gsap.to(svgCursorRule, {
      cssRule: { stroke: '#' + interfaceColor },
      ease: 'Power4.easeOut',
      duration: 1,
    });
  }
}

function mouseDown(e: MouseEvent) {
  e.preventDefault();
  controls.holdingMouseDown = true;

  if (itemOpen) {
    if (linkIntersect.length > 0) {
      if (linkIntersect[0].object.onClick) linkIntersect[0].object.onClick();
    } else {
      closeItem();
    }
  } else {
    if (intersects.length > 0) {
      if (intersects[0].object.onClick) {
        intersects[0].object.onClick();
        cursor.dataset.cursor = 'cross';
      }
    } else {
      cursor.dataset.cursor = 'move';

      gsap.to(controls, {
        delay: 0.7,
        autoMoveSpeed: 20,
        duration: 0.5,
      });
    }
  }
}

function mouseUp() {
  if (!itemOpen) cursor.dataset.cursor = 'pointer';
  controls.holdingMouseDown = false;
  gsap.killTweensOf(controls, { autoMoveSpeed: true });
  controls.autoMoveSpeed = 0;
}

function mouseMove(e: MouseEvent) {
  if (!itemOpen && !controls.holdingMouseDown) {
    mouse.x = (e.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(e.clientY / renderer.domElement.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    intersects = raycaster.intersectObjects(sectionItemsMeshes);

    if (intersects.length > 0) {
      cursor.dataset.cursor = 'eye';
    } else if (cursor.dataset.cursor !== 'pointer') {
      cursor.dataset.cursor = 'pointer';
    }
  }

  if (itemOpen && itemOpen.linkBox) {
    mouse.x = (e.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(e.clientY / renderer.domElement.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    linkIntersect = raycaster.intersectObject(itemOpen.linkBox);

    if (linkIntersect.length > 0) {
      cursor.dataset.cursor = 'eye';
    } else if (cursor.dataset.cursor !== 'cross') {
      cursor.dataset.cursor = 'cross';
    }
  }

  mousePerspective.x = e.clientX / window.innerWidth - 0.5;
  mousePerspective.y = e.clientY / window.innerHeight - 0.5;
  updatingPerspective = true;

  if (!touchEnabled) {
    gsap.to('.cursor', {
      x: e.clientX,
      y: e.clientY,
      ease: 'Power4.easeOut',
      duration: 1.5,
    });
  }
}

function scroll(ev: WheelEvent) {
  const delta = normalizeWheelDelta(ev);

  scrollPos += -delta * 20;
  scrolling = true;

  function normalizeWheelDelta(e: WheelEvent) {
    if (e.detail && e.deltaY) return (e.deltaY / e.detail / 40) * (e.detail > 0 ? 1 : -1); // Opera
    else if (e.deltaY) return -e.deltaY / 60; // Firefox
    else return e.deltaY / 120; // IE,Safari,Chrome
  }
}

function initListeners() {
  window.addEventListener('mousemove', mouseMove, false);

  renderer.domElement.addEventListener('mousedown', mouseDown, false);
  renderer.domElement.addEventListener('mouseup', mouseUp, false);
  renderer.domElement.addEventListener('wheel', scroll, false);

  document.querySelector('.enter')?.addEventListener('click', moveToStart, false);

  const gesture = new TinyGesture(renderer.domElement);
  gesture.on('panmove', (_e) => {
    scrollPos += -gesture.velocityY! * 6;
    scrolling = true;
  });
  gesture.on('panend', (_e) => {
    controls.autoMoveSpeed = 0;
  });

  gesture.on('longpress', (_e) => {
    controls.autoMoveSpeed = 10;
  });

  if (!touchEnabled) {
    cursor.dataset.cursor = 'pointer';
  }
}

function preventPullToRefresh() {
  let prevent = false;

  renderer.domElement.addEventListener('touchstart', function (e) {
    if (e.touches.length !== 1) {
      return;
    }

    var scrollY =
      window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop;
    prevent = scrollY === 0;
  });

  renderer.domElement.addEventListener('touchmove', function (e) {
    if (prevent) {
      prevent = false;
      e.preventDefault();
    }
  });
}

function updatePerspective() {
  gsap.to(camera.rotation, {
    x: -mousePerspective.y * 0.5,
    y: -mousePerspective.x * 0.5,
    ease: 'Power4.easeOut',
    duration: 4,
  });

  updatingPerspective = false;
}

const loop = () => {
  if (!touchEnabled && updatingPerspective) {
    updatePerspective();
    updatingPerspective = false;
  }

  if (controls.autoMoveSpeed > 0) {
    scrolling = true;
    scrollPos += controls.autoMoveSpeed;
  }

  // smooth scrolling
  if (allowScrolling && scrolling) {
    if (scrollPos <= 0) scrollPos = 0;
    if (scrollPos >= -stopScrollPos) scrollPos = -stopScrollPos;

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
document.body.classList.add('ready');

function moveToStart() {
  gsap.to(camera.position, {
    y: 0,
    ease: 'Expo.easeInOut',
    duration: 2,
  });

  gsap.to('.loading', {
    y: '-100%',
    ease: 'Expo.easeInOut',
    duration: 2,
    onComplete() {
      (document.querySelector('.loading') as HTMLElement).style.display = 'none';
    },
  });
}
