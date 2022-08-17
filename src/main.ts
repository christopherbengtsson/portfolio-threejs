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
import { createComputer, sceneGroup } from './components/computer';

let autoScroll = {
  holdingMouseDown: false,
  autoMoveSpeed: 0,
  scrollPos: 0,
  scrolling: false,
  allowScrolling: true,
};
let stopScrollPosition: number;
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

const categorySections: { [key: string]: Group } = {};
const sectionItems: { [key: string]: IItem } = {};
const sectionItemsMeshes: any[] = [];
const videoItems: any[] = [];

const touchEnabled = 'ontouchstart' in window;
if (touchEnabled) document.documentElement.classList.add('touch-enabled');
else document.documentElement.classList.add('enable-cursor');

const categoryPositions: { [key: string]: number } = {};

const texturesAndFonts: ITexturesAndFonts = {
  textures: {},
  fonts: {},
};

document.body.appendChild(renderer.domElement);
preventPullToRefresh();
const grid = new Group();
scene.add(grid);

createComputer(sectionItemsMeshes, (sceneGroup: Group) => grid.add(sceneGroup));
const categoryData = generateConfig();
const _assets = await loadAssets(categoryData);
_assets.forEach((asset) => {
  if ((asset as Texture).image) {
    texturesAndFonts.textures[(asset as Texture).name] = asset as Texture;
  } else {
    texturesAndFonts.fonts[(asset as any).data.familyName] = asset as Font;
  }
});

scene.add(particleSystem);

function createPortfolio() {
  let itemIndexTotal = 0,
    nextCategoryPosition = 0;

  for (const category in categoryData) {
    const categoryGroup = new Group();

    if (category === 'intro') {
      categoryGroup.add(...createIntroSection(texturesAndFonts));
    } else if (category === 'end') {
      categoryGroup.add(...createEndSection(texturesAndFonts));
    } else {
      categoryGroup.add(...createGenericSection(category, texturesAndFonts));

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

        categoryGroup.add(item.group);
        sectionItemsMeshes.push(item.mesh);

        if (data.type === 'VIDEO') {
          videoItems.push(item.mesh);
        }

        itemIndex++;
        itemIndexTotal++;
      });
    }

    const bbox = new Box3().setFromObject(categoryGroup);

    const categoryOffset = 1100;
    categoryGroup.position.z = nextCategoryPosition;
    categoryPositions[category] = nextCategoryPosition + categoryOffset;

    const customOffset = categoryData[category].positionOffset;
    const positionOffset = customOffset ? customOffset : CAMERA_POSITION;

    nextCategoryPosition += bbox.min.z - positionOffset;

    if (category === 'end') {
      stopScrollPosition = categoryGroup.position.z;
    }

    categorySections[category] = categoryGroup;
    grid.add(categoryGroup);
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
    eyeCursorElClose();
    itemAnimating = false;
  };

  animateItemOpen(item, onAnimationComplete, posOffset, grid, sectionItems);
}

function closeItem() {
  if (!itemAnimating && itemOpen) {
    itemAnimating = true;
    eyeCursorElLeave();

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

  // Close item or item link click
  if (itemOpen) {
    linkIntersect.length === 0 ? closeItem() : linkIntersect[0]?.object.onClick?.();
    return;
  }

  // Open item
  if (intersects.length > 0 && intersects[0].object.onClick) {
    intersects[0].object.onClick();
    eyeCursorElClose();

    return;
  }

  // Back to start button
  if (hoveringGoBack) {
    autoScroll.scrolling = true;

    const onUpdate = () => {
      autoScroll.scrolling = true;
    };

    return animateScrollToStart(autoScroll, onUpdate);
  }

  // Autoscroll
  eyeCursorElMove();
  animateAutoScroll(autoScroll);
}

function mouseUp() {
  if (!itemOpen) eyeCursorElLeave();
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
        eyeCursorElClick();
        hoveringGoBack = true;
        goBackIntersectsGroup.userData.arrowGsap.timeScale(2);
      } else {
        if (hoveringGoBack) {
          eyeCursorElLeave();
          hoveringGoBack = false;
          goBackIntersectsGroup.userData.arrowGsap.timeScale(1);
        }
      }
    } else {
      intersects = raycaster.intersectObjects(sectionItemsMeshes);

      if (intersects.length > 0) {
        eyeCursorElEnter();
      } else {
        if (cursor.dataset.cursor !== 'default') eyeCursorElLeave();
      }
    }
  }

  if (itemOpen && itemOpen.linkBox) {
    linkIntersect = raycaster.intersectObject(itemOpen.linkBox);

    if (linkIntersect.length > 0) {
      eyeCursorElClick();
    } else if (cursor.dataset.cursor !== 'cross') {
      eyeCursorElClose();
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
    eyeCursorElLeave();
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

function eyeCursorElMove() {
  cursor.dataset.cursor = 'move';
}

function eyeCursorElClose() {
  cursor.dataset.cursor = 'cross';
}

function eyeCursorElEnter() {
  cursor.dataset.cursor = 'eye';
}
function eyeCursorElClick() {
  cursor.dataset.cursor = 'pointer';
}

function eyeCursorElLeave() {
  cursor.dataset.cursor = 'default';
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
    if (autoScroll.scrollPos >= -stopScrollPosition) autoScroll.scrollPos = -stopScrollPosition;

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

createPortfolio();
loop();
initListeners();
initCursorListeners();
document.body.classList.add('ready');
