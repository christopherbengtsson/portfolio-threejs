import { MeshBasicMaterial } from 'three';

export const textMaterial = new MeshBasicMaterial({ color: 0x1b42d8, transparent: true });
export const textOutlineMaterial = new MeshBasicMaterial({
  color: 0x1b42d8,
  transparent: true,
  wireframe: true,
});
export const captionTextMaterial = new MeshBasicMaterial({
  color: 0x1b42d8,
  transparent: true,
  opacity: 0,
  visible: false,
});
export const linkUnderlineMaterial = new MeshBasicMaterial({
  color: 0x1b42d8,
  transparent: true,
  opacity: 0,
  visible: false,
});
