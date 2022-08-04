import { LinearFilter, Texture, TextureLoader, Vector2, VideoTexture } from 'three';
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { progressBar, progressEl } from '../core/dom';
import { renderer } from '../core/threejs/renderer';
import { IAssets } from '../types';
import { progressPromise } from './progress';

export const loadAssets = (categoryData: IAssets) => {
  const assetLoadPromises: Promise<Texture | Font>[] = [];

  const imageLoader = new TextureLoader();
  imageLoader.crossOrigin = '';

  for (const category in categoryData) {
    categoryData[category].data.forEach(
      ({ filepath, filename }: { filename: string; filepath: string }) => {
        if (filename.endsWith('.mp4')) {
          const video = document.createElement('video');
          video.autoplay = false;
          video.loop = true;
          video.muted = true;
          video.playsInline = true;
          video.crossOrigin = 'anonymous';
          video.setAttribute('style', 'position:absolute;height:0');
          video.src = filepath;
          document.body.appendChild(video);
          video.load();
          assetLoadPromises.push(
            new Promise((resolve) => {
              videoPromise(video, filename, resolve);
            })
          );
        } else {
          assetLoadPromises.push(
            new Promise((resolve) => {
              imageLoader.load(filepath, (texture) => {
                texture.name = filename;
                texture.userData = {
                  mediaType: 'IMAGE',
                  size: new Vector2(texture.image.width / 2, texture.image.height / 2),
                };

                texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
                texture.needsUpdate = true;
                renderer.initTexture(texture);

                resolve(texture);
              });
            })
          );
        }
      }
    );
  }

  const fontLoader = new FontLoader();
  const fonts = ['fonts/Roboto-Regular.json']; // TODO

  for (const font of fonts) {
    assetLoadPromises.push(
      new Promise((resolve) =>
        fontLoader.load(font, (font) => {
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

const videoPromise = (
  video: HTMLVideoElement,
  filename: string,
  resolve: (value: Texture) => void
) => {
  video.oncanplaythrough = () => {
    let texture = new VideoTexture(video);
    texture.minFilter = texture.magFilter = LinearFilter;
    texture.name = filename;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    texture.userData = {
      mediaType: 'VIDEO',
      size: new Vector2(texture.image.videoWidth / 2, texture.image.videoHeight / 2),
    };

    renderer.initTexture(texture);

    video.oncanplaythrough = null;

    resolve(texture);
  };
};
