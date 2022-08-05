import './style.scss';
import { Font } from 'three/examples/jsm/loaders/FontLoader.js';
import { Box3, Color, Group, Intersection, Texture, Vector2 } from 'three';
import ThreeMeshUI from 'three-mesh-ui';
import gsap from 'gsap';
import TinyGesture from 'tinygesture';

import { mode, renderer, scale, scene, stats } from './core/threejs/renderer';
import {
  camera,
  cameraViewProjectionMatrix,
  CAMERA_POSITION,
  frustum,
  mouse,
  mousePerspective,
  raycaster,
} from './core/threejs/camera';
import {
  textMaterial,
  textOutlineMaterial,
  captionTextMaterial,
  linkUnderlineMaterial,
} from './core/threejs/materials';

import { loadAssets } from './utils/assetLoader';
import { categoriesCommonConfig } from './utils/categoriesCommonConfig';
import { cursor, cursorSvgs, mainSvgs } from './core/dom';
import { generateConfig } from './utils/generateConfig';
import { IItem, IObject3D, ITexturesAndFonts } from './types';
import { createEndSection, createGenericSection, createIntroSection } from './components/category';
import { createSectionItem } from './components/item';
import { createParticleSystem } from './components/particles';

let autoScroll = {
  holdingMouseDown: false,
  autoMoveSpeed: 0,
  scrollPos: 0,
  scrolling: false,
  allowScrolling: true,
};
let stopScrollPos: number;
let itemOpen: any = null;
let itemAnimating = false;
let origGridPos: any;
let updatingPerspective = false;
let activeCategory = 'education';
let remainingCategories: string[] = [];
let intersects: Intersection<IObject3D>[] = [];
let linkIntersect: Intersection<IObject3D>[] = [];
let goBackIntersects: Intersection<IObject3D>[] = [];
let hoveringGoBack: boolean;

const touchEnabled = 'ontouchstart' in window;
if (touchEnabled) document.documentElement.classList.add('touch-enabled');
else document.documentElement.classList.add('enable-cursor');

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

const particleSystem = createParticleSystem();
scene.add(particleSystem);

const categorySections: { [key: string]: Group } = {};
const sectionItems: { [key: string]: IItem } = {};
const sectionItemsMeshes: any[] = [];
const videoItems: any[] = [];

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
      const item = createSectionItem(
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

      if (data.type === 'VIDEO') {
        videoItems.push(item.mesh);
      }

      itemIndex++;
      itemIndexTotal++;
    });
  }

  const bbox = new Box3().setFromObject(categorySections[category]);

  categorySections[category].position.z = nextCategoryPos;
  categoryPositions[category] = nextCategoryPos + 1100;

  let positionOffset = CAMERA_POSITION;
  if (category === 'intro') positionOffset = 1700;
  if (category === 'projects') positionOffset = 1500;
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
  autoScroll.allowScrolling = false;

  let posOffset = categorySections[activeCategory].position.z;

  if (item.category !== activeCategory) {
    posOffset = categorySections[remainingCategories[remainingCategories.length - 2]].position.z;
  }

  const onComplete = () => {
    cursor.dataset.cursor = 'cross';
    itemAnimating = false;
  };

  gsap.to(item.group.position, {
    x: 0,
    y: 0,
    ease: 'Expo.easeInOut',
    duration: 1.5,
    onComplete: item.meshGroup.children.length === 1 ? onComplete : () => {},
  });

  if (item.meshGroup.children.length > 1) {
    gsap.to(item.meshGroup.rotation, {
      y: 3.15,
      delay: 1.4,
      ease: 'Expo.easeInOut',
      duration: 1,
      onComplete,
    });
  }

  gsap.to(item.uniforms.progress, {
    value: 1,
    ease: 'Expo.easeInOut',
    duration: 1.5,
  });

  gsap.to(grid.position, {
    z: -(posOffset - -item.group.position.z) + (scale < 0.5 ? 450 : 300),
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
    if (sectionItems[itemKey].align === 0) position.set(-700, 700); // bottom left
    if (sectionItems[itemKey].align === 1) position.set(700, 700); // bottom right
    if (sectionItems[itemKey].align === 2) position.set(700, -700); // top right
    if (sectionItems[itemKey].align === 3) position.set(-700, -700); // top left

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

    gsap.to(itemOpen.meshGroup.rotation, {
      y: 0,
      ease: 'Expo.easeInOut',
      duration: 0.5,
    });

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
        autoScroll.allowScrolling = true;
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
    let interfaceColor: string;

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

    gsap.to(textMaterial.color, {
      r: textColor.r,
      g: textColor.g,
      b: textColor.b,
      ease: 'Power4.easeOut',
      duration: 1,
    });

    gsap.set([captionTextMaterial.color, linkUnderlineMaterial.color], {
      r: textColor.r,
      g: textColor.g,
      b: textColor.b,
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

    gsap.to(mainSvgs, { fill: `#${interfaceColor}`, ease: 'Power4.easeOut', duration: 1 });
    gsap.to(cursorSvgs, { stroke: `#${interfaceColor}`, ease: 'Power4.easeOut', duration: 1 });

    document
      .querySelector('meta[name=theme-color]')!
      .setAttribute('content', '#' + bgColor.getHexString());
  }
}

function mouseDown(e: MouseEvent) {
  e.preventDefault();
  e.stopPropagation();

  autoScroll.holdingMouseDown = true;

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
    } else if (hoveringGoBack) {
      autoScroll.scrolling = true;

      gsap.to(autoScroll, {
        scrollPos: 0,
        ease: 'Expo.easeInOut',
        duration: 2,
        onUpdate: () => {
          autoScroll.scrolling = true;
        },
      });
    } else {
      cursor.dataset.cursor = 'move';

      gsap.to(autoScroll, {
        delay: 0.7,
        autoMoveSpeed: 20,
        duration: 0.5,
      });
    }
  }
}

function mouseUp() {
  if (!itemOpen) cursor.dataset.cursor = 'pointer';
  autoScroll.holdingMouseDown = false;
  gsap.killTweensOf(autoScroll, { autoMoveSpeed: true });
  autoScroll.autoMoveSpeed = 0;
}

function mouseMove(e: MouseEvent) {
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

  if (!renderer || e.target !== renderer.domElement) return;

  mouse.x = (e.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = -(e.clientY / renderer.domElement.clientHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  if (!itemOpen && !autoScroll.holdingMouseDown) {
    if (activeCategory === 'end') {
      intersects = [];

      const goBackIntersectsGroup = categorySections['end'].children.find(
        ({ name }) => name === 'backToStart'
      )!;
      goBackIntersects = raycaster.intersectObjects(goBackIntersectsGroup.children);

      if (goBackIntersects.length > 0) {
        cursor.dataset.cursor = 'none';
        hoveringGoBack = true;
        goBackIntersectsGroup.userData.arrowGsap.timeScale(2);
      } else {
        if (hoveringGoBack) {
          cursor.dataset.cursor = 'pointer';
          hoveringGoBack = false;
          goBackIntersectsGroup.userData.arrowGsap.timeScale(1);
        }
      }
    } else {
      intersects = raycaster.intersectObjects(sectionItemsMeshes);

      if (intersects.length > 0) {
        cursor.dataset.cursor = 'eye';
      } else {
        if (cursor.dataset.cursor !== 'pointer') cursor.dataset.cursor = 'pointer';
      }
    }
  }

  if (itemOpen && itemOpen.linkBox) {
    linkIntersect = raycaster.intersectObject(itemOpen.linkBox);

    if (linkIntersect.length > 0) {
      cursor.dataset.cursor = 'eye';
    } else if (cursor.dataset.cursor !== 'cross') {
      cursor.dataset.cursor = 'cross';
    }
  }
}

function scroll(ev: WheelEvent) {
  const delta = normalizeWheelDelta(ev);

  autoScroll.scrollPos += -delta * 20;
  autoScroll.scrolling = true;

  function normalizeWheelDelta(e: WheelEvent) {
    if (e.detail && e.deltaY) return (e.deltaY / e.detail / 40) * (e.detail > 0 ? 1 : -1); // Opera
    else if (e.deltaY) return -e.deltaY / 60; // Firefox
    else return e.deltaY / 120; // IE,Safari,Chrome
  }
}

function initListeners() {
  renderer.domElement.addEventListener('mousedown', mouseDown, false);
  renderer.domElement.addEventListener('mouseup', mouseUp, false);
  renderer.domElement.addEventListener('wheel', scroll, false);

  document.querySelector('.enter')?.addEventListener('click', moveToStart, false);

  const gesture = new TinyGesture(renderer.domElement);
  gesture.on('panmove', (_e) => {
    autoScroll.scrollPos += -gesture.velocityY! * 6;
    autoScroll.scrolling = true;
  });
  gesture.on('panend', (_e) => {
    autoScroll.autoMoveSpeed = 0;
  });

  gesture.on('longpress', (_e) => {
    autoScroll.autoMoveSpeed = 10;
  });

  if (!touchEnabled) {
    cursor.dataset.cursor = 'pointer';
  }
}

function initCursorListeners() {
  window.addEventListener('mousemove', mouseMove, false);

  let eyeCursorEls = document.querySelectorAll('.cursor-eye');
  for (let i = 0; i < eyeCursorEls.length; i++) {
    eyeCursorEls[i].addEventListener('mouseenter', eyeCursorElEnter, false);
    eyeCursorEls[i].addEventListener('mouseleave', eyeCursorElLeave, false);
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

  const backToStart = categorySections['end'].children.find(({ name }) => name === 'backToStart')!;
  const arrow = backToStart.children.find(({ name }) => name === 'arrow')!;

  if (activeCategory === 'end') {
    gsap.to(arrow.rotation, {
      x: -1.5 + mousePerspective.y * 0.2,
      y: mousePerspective.x * 0.8,
      ease: 'Power4.easeOut',
      duration: 4,
    });
  }

  updatingPerspective = false;
}

function eyeCursorElEnter() {
  cursor.dataset.cursor = 'eye';
}

function eyeCursorElLeave() {
  cursor.dataset.cursor = 'pointer';
}

function handleVideos() {
  camera.updateMatrixWorld();
  cameraViewProjectionMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  frustum.setFromProjectionMatrix(cameraViewProjectionMatrix);

  for (let i = 0; i < videoItems.length; i++) {
    if (
      frustum.intersectsObject(videoItems[i]) &&
      videoItems[i].material.uniforms._texture.value.image.paused
    ) {
      videoItems[i].material.uniforms._texture.value.image.play();
      continue;
    }

    if (
      !frustum.intersectsObject(videoItems[i]) &&
      !videoItems[i].material.uniforms._texture.value.image.paused
    ) {
      videoItems[i].material.uniforms._texture.value.image.pause();
    }
  }
}

const loop = () => {
  if (!touchEnabled && updatingPerspective) {
    updatePerspective();
    updatingPerspective = false;
  }

  if (autoScroll.autoMoveSpeed > 0) {
    autoScroll.scrolling = true;
    autoScroll.scrollPos += autoScroll.autoMoveSpeed;
  }

  // smooth scrolling
  if (autoScroll.allowScrolling && autoScroll.scrolling) {
    if (autoScroll.scrollPos <= 0) autoScroll.scrollPos = 0;
    if (autoScroll.scrollPos >= -stopScrollPos) autoScroll.scrollPos = -stopScrollPos;

    const delta = (autoScroll.scrollPos - grid.position.z) / 12;
    grid.position.z += delta;

    if (Math.abs(delta) < 8) handleVideos();

    changeColours();

    if (Math.abs(delta) > 0.1) {
      autoScroll.scrolling = true;
    } else {
      autoScroll.scrolling = false;
    }
  }

  if (hoveringGoBack) {
    const backToStart = categorySections['end'].children.find(
      ({ name }) => name === 'backToStart'
    )!;
    const circle = backToStart.children.find(({ name }) => name === 'circle')!;
    circle.rotation.z += 0.005;
  }

  if (mode === 'development') {
    stats.update();
  }

  ThreeMeshUI.update();

  renderer.render(scene, camera);
  requestAnimationFrame(loop);
};

loop();
initListeners();
initCursorListeners();
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
    onComplete: () => {
      (document.querySelector('.loading') as HTMLElement).style.display = 'none';
    },
  });

  gsap.to('.social', {
    y: 0,
    delay: 1,
    ease: 'Expo.easeInOut',
    duration: 2,
  });
}
