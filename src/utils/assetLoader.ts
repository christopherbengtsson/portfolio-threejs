import { Texture, TextureLoader, Vector2 } from 'three';
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { progressBar, progressEl } from '../core/dom';
import { renderer } from '../core/threejs/renderer';
import { IAssets, ITexture } from '../types';
import { progressPromise } from './progress';

export const loadAssets = (categoryData: IAssets) => {
  const assetLoadPromises: Promise<Texture | Font>[] = [];

  const imageLoader = new TextureLoader();
  imageLoader.crossOrigin = '';

  for (const category in categoryData) {
    categoryData[category].data.forEach(
      ({ filepath, filename }: { filename: string; filepath: string }) => {
        assetLoadPromises.push(
          new Promise((resolve) => {
            imageLoader.load(filepath, (texture) => {
              texture.name = filename;
              (texture as ITexture).mediaType = 'image';
              (texture as ITexture).size = new Vector2(
                texture.image.width / 2,
                texture.image.height / 2
              );
              texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
              texture.needsUpdate = true;
              renderer.initTexture(texture);

              resolve(texture);
            });
          })
        );
      }
    );
  }

  const fontLoader = new FontLoader();
  const fonts = ['fonts/Roboto_Regular.json']; // TODO

  for (const font of fonts) {
    assetLoadPromises.push(
      new Promise((resolve) =>
        fontLoader.load(font, (font) => {
          console.log(font);
          resolve(font);
        })
      )
    );
  }

  return progressPromise(assetLoadPromises, update);
};

function update(completed: number, total: number) {
  const currentProgress = Math.round((completed / total) * 100);
  progressEl.innerHTML = currentProgress + '%';
  progressBar.style.strokeDashoffset = (252.363 - 252.363 * (completed / total)).toString();
}
