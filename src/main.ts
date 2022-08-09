import './style.scss';
import { Font } from 'three/examples/jsm/loaders/FontLoader.js';
import { Box3, Color, Group, Intersection, Texture } from 'three';
import ThreeMeshUI from 'three-mesh-ui';
import TinyGesture from 'tinygesture';

import { mode, renderer, scene, stats } from './core/threejs/renderer';
import {
  camera,
  cameraViewProjectionMatrix,
  CAMERA_POSITION,
  frustum,
  mouse,
  mousePerspective,
  raycaster,
} from './core/threejs/camera';
import { captionTextMaterial, linkUnderlineMaterial } from './core/threejs/materials';

import { loadAssets } from './utils/assetLoader';
import { categoriesCommonConfig } from './utils/categoriesCommonConfig';
import { cursor } from './core/dom';
import { generateConfig } from './utils/generateConfig';
import { IItem, IObject3D, ITexturesAndFonts } from './types';
import { createEndSection, createGenericSection, createIntroSection } from './components/category';
import { createSectionItem } from './components/item';
import { animateParticles, particleSystem } from './components/particles';

import {
  animateItemOpen,
  animateItemClose,
  animateColors,
  animateAutoScroll,
  animateScrollToStart,
  stopAutoScrollAnimation,
  animateCursor,
  animateMoveToStart,
  animatePerspective,
} from './gsapAnimations';

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
  itemAnimating = true;
  itemOpen = item;
  origGridPos = grid.position.z;
  autoScroll.allowScrolling = false;
  autoScroll.scrolling = false;

  let posOffset = categorySections[activeCategory].position.z;

  if (item.category !== activeCategory) {
    posOffset = categorySections[remainingCategories[remainingCategories.length - 2]].position.z;
  }

  const onAnimationComplete = () => {
    cursor.dataset.cursor = 'cross';
    itemAnimating = false;
  };

  animateItemOpen(item, onAnimationComplete, posOffset, grid, sectionItems);
}

function closeItem() {
  if (!itemAnimating && itemOpen) {
    itemAnimating = true;
    cursor.dataset.cursor = 'pointer';

    const onGridScrollAnimationComplete = () => {
      autoScroll.allowScrolling = true;
      itemOpen = null;
      itemAnimating = false;
    };
    const onMaterialsOpacityAnimationComplete = () => {
      captionTextMaterial.visible = false;
      linkUnderlineMaterial.visible = false;
      if (itemOpen.caption) itemOpen.caption.visible = false;
      if (itemOpen.linkGroup) itemOpen.linkGroup.visible = false;
    };

    animateItemClose(
      itemOpen,
      grid,
      origGridPos,
      sectionItems,
      onGridScrollAnimationComplete,
      onMaterialsOpacityAnimationComplete
    );
  }
}

function changeColours() {
  remainingCategories = Object.keys(categoryPositions).filter((key) => {
    return grid.position.z > -categoryPositions[key];
  });

  if (
    remainingCategories[remainingCategories.length - 1] &&
    activeCategory !== remainingCategories[remainingCategories.length - 1]
  ) {
    activeCategory = remainingCategories[remainingCategories.length - 1];

    const activeCategoryOutlineColor = categoriesCommonConfig[activeCategory].outlineTextColor;
    const bgColor = new Color(categoriesCommonConfig[activeCategory].bgColor);
    const textColor = new Color(categoriesCommonConfig[activeCategory].textColor);
    const tintColor = new Color(categoriesCommonConfig[activeCategory].tintColor);

    animateColors(bgColor, textColor, tintColor, activeCategoryOutlineColor, sectionItems);

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

      const onUpdate = () => {
        autoScroll.scrolling = true;
      };

      animateScrollToStart(autoScroll, onUpdate);
    } else {
      cursor.dataset.cursor = 'move';
      animateAutoScroll(autoScroll);
    }
  }
}

function mouseUp() {
  if (!itemOpen) cursor.dataset.cursor = 'pointer';
  autoScroll.holdingMouseDown = false;
  stopAutoScrollAnimation(autoScroll);
  autoScroll.autoMoveSpeed = 0;
}

function mouseMove(e: MouseEvent) {
  mousePerspective.x = e.clientX / window.innerWidth - 0.5;
  mousePerspective.y = e.clientY / window.innerHeight - 0.5;
  updatingPerspective = true;

  if (!touchEnabled) {
    animateCursor(e.clientX, e.clientY);
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

  document.querySelector('.enter')?.addEventListener('click', animateMoveToStart, false);

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
  const backToStart = categorySections['end'].children.find(({ name }) => name === 'backToStart')!;
  const arrow = backToStart.children.find(({ name }) => name === 'arrow')!;
  const lastCategory = activeCategory === 'end';

  animatePerspective(mousePerspective.y, mousePerspective.x, lastCategory, arrow);

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
  const delta = (autoScroll.scrollPos - grid.position.z) / 12;
  if (autoScroll.allowScrolling && autoScroll.scrolling) {
    if (autoScroll.scrollPos <= 0) autoScroll.scrollPos = 0;
    if (autoScroll.scrollPos >= -stopScrollPos) autoScroll.scrollPos = -stopScrollPos;

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

  animateParticles(autoScroll.scrolling && autoScroll.allowScrolling, delta);

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
