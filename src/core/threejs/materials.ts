import { MeshBasicMaterial } from 'three';
import { initialColor } from '../../utils/categoriesCommonConfig';

export const textMaterial = new MeshBasicMaterial({ color: initialColor, transparent: true });
export const textOutlineMaterial = new MeshBasicMaterial({
  color: initialColor,
  transparent: true,
});
export const captionTextMaterial = new MeshBasicMaterial({
  color: initialColor,
  transparent: true,
  opacity: 0,
  visible: false,
});
export const linkUnderlineMaterial = new MeshBasicMaterial({
  color: initialColor,
  transparent: true,
  opacity: 0,
  visible: false,
});
