import { Texture, TextureLoader, Vector2 } from 'three';
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { progress } from '../core/dom';
import { renderer } from '../core/renderer';
import { IAssets } from './generateConfig';
import { progressPromise } from './progress';

export const loadAssets = (categoryData: IAssets) => {
  console.log(categoryData);
  const assetLoadPromises: Promise<Texture | Font>[] = [];

  const imageLoader = new TextureLoader();
  imageLoader.crossOrigin = '';

  for (const category in categoryData) {
    categoryData[category].data.forEach(({ filename, ...data }) => {
      assetLoadPromises.push(
        new Promise((resolve) => {
          imageLoader.load(`assets/${category}/${filename}`, (texture) => {
            texture.name = filename;
            texture.mediaType = 'image';
            texture.size = new Vector2(texture.image.width / 2, texture.image.height / 2);
            texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
            texture.needsUpdate = true;
            renderer.initTexture(texture);

            resolve(texture);
          });
        })
      );
    });
  }

  const fontLoader = new FontLoader();
  const fonts = ['fonts/schnyder.json']; // TODO

  for (const font of fonts) {
    assetLoadPromises.push(
      new Promise((resolve) => fontLoader.load(font, (font) => resolve(font)))
    );
  }

  return progressPromise(assetLoadPromises, update);
};

function update(completed: number, total: number) {
  const currentProgress = Math.round((completed / total) * 100);
  progress.innerHTML = currentProgress.toString();
}
