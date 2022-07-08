import { Texture } from 'three';
import { Font } from 'three/examples/jsm/loaders/FontLoader';
import { TextureWProps } from './types';
import { loadAssets } from './utils/assetLoader';
import { generateConfig } from './utils/generateConfig';

const categoryData = generateConfig();
const assets: {
  textures: { [key: string]: TextureWProps };
  fonts: { [key: string]: Font };
} = {
  textures: {},
  fonts: {},
};

loadAssets(categoryData).then((_assets) => {
  _assets.forEach((asset) => {
    if ((asset as Texture).image) {
      assets.textures[(asset as Texture).name] = asset as Texture;
    } else {
      assets.fonts[(asset as any).data.familyName] = asset as Font;
    }
  });
});

export default {
  categoryData,
  assets,
};
