import { Color, Fog, Scene, WebGLRenderer } from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';

export const mode = import.meta.env.MODE;
export const stats = Stats();
if (mode === 'development') {
  document.body.appendChild(stats.dom);
}

export const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

export const scale = Math.min(1, sizes.width / 1400);

export const renderer = new WebGLRenderer({
  antialias: true,
  alpha: true,
});

export const scene = new Scene();
scene.background = new Color(0xaec7c3);
scene.fog = new Fog(0xaec7c3, 1400, 2000);
scene.scale.set(scale, scale, 1);

function updateRenderer() {
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // To avoid performance problems on devices with higher pixel ratio
}

window.addEventListener(
  'resize',
  () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    updateRenderer();
  },
  false
);

updateRenderer();
