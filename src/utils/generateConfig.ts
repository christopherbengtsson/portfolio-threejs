import { fileData } from './fileData';
import { categoriesCommonConfig } from './categoriesCommonConfig';
import _merge from 'lodash.merge';
import { IAssets, ICategoryData, IData } from '../types';

export const generateConfig = (): IAssets => {
  const generatedDataFromAssets: ICategoryData = {
    intro: { data: [] },
    experience: { data: [] },
    projects: { data: [] },
    whoami: { data: [] },
    end: { data: [] },
  };

  for (const category in fileData) {
    for (const filename in fileData[category]) {
      const data: IData = fileData[category][filename];

      generatedDataFromAssets[category] = {
        data: [...generatedDataFromAssets[category].data, data],
      };
    }
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
