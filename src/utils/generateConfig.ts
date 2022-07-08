const modules = import.meta.globEager('/assets/**/*', { as: 'url' });
import { fileData } from './fileData';
import { categoriesCommonConfig } from './categoriesCommonConfig';
import _merge from 'lodash.merge';
import { IAssets, ICategoryData, IData } from '../types';
import { mode } from '../core/renderer';

function assetUrl(name: string): string {
  const s = Object.keys(modules).find((path) => path.endsWith(name));
  return modules[s!]?.default;
}

function splitPath(path: string) {
  const knownPath = path.match(/.+?(?=assets\/)/)![0];
  return path.replace(knownPath, '').replace('assets/', '').split('/');
}

export const generateConfig = (): IAssets => {
  const generatedDataFromAssets: ICategoryData = {};

  generatedDataFromAssets['intro'] = {
    data: [],
  };
  generatedDataFromAssets['end'] = {
    data: [],
  };

  for (const path in modules) {
    const filepath = assetUrl(path);
    const prodSplit = splitPath(filepath);
    const devSplit = splitPath(path);

    const category = devSplit[0];
    const chunkedFilename = mode === 'production' ? prodSplit[0] : devSplit[1];
    const filename = devSplit[1];

    const data: IData = {
      filepath,
      filename: chunkedFilename,
      caption: fileData[category][filename].caption,
      link: fileData[category][filename].link,
    };

    !generatedDataFromAssets[category]
      ? (generatedDataFromAssets[category] = {
          data: [data],
        })
      : (generatedDataFromAssets[category] = {
          data: [...generatedDataFromAssets[category].data, data],
        });
  }

  const categoriesToUse = Object.keys(generatedDataFromAssets);
  const filteredCommonConfig = Object.fromEntries(
    Object.entries(categoriesCommonConfig).filter(([key]) => categoriesToUse.includes(key))
  );

  const mergedAssets: IAssets = {};
  _merge(mergedAssets, generatedDataFromAssets, filteredCommonConfig);

  const assets = Object.fromEntries(
    Object.entries(mergedAssets).sort((x, y) => (x as any)[1].order - (y as any)[1].order)
  );
  console.log('ASSETS', assets);
  return assets;
};
