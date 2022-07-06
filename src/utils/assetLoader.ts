import { Texture, TextureLoader } from 'three';
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { generateConfig } from './generateConfig';

export const loadAssets = () => {
   let categoryData = generateConfig();
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
                  resolve(texture);
               });
            }),
         );
      });
   }

   const fontLoader = new FontLoader();
   const fonts = ['fonts/schnyder.json']; // TODO

   for (const font of fonts) {
      assetLoadPromises.push(
         new Promise((resolve) =>
            fontLoader.load(font, (font) => resolve(font)),
         ),
      );
   }

   return Promise.all(assetLoadPromises);
};
