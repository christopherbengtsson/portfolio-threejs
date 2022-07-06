const modules = (import.meta as any).glob('/assets/**/*');
import { fileData } from './fileData';
import {
   categoriesCommonConfig,
   ICommonConfig,
} from './categoriesCommonConfig';
import _merge from 'lodash.merge';

interface IData {
   filename: string;
   caption: string;
   link: string;
}
interface ICategoryData {
   [key: string]: {
      data: IData[];
   };
}
export type IAssets = ICommonConfig & ICategoryData;

export const generateConfig = (): IAssets => {
   const generatedDataFromAssets: ICategoryData = {};

   for (const path in modules) {
      // /assets/category/filename.extension

      const splitPath = path.replace('/assets/', '').split('/');
      const category = splitPath[0];
      const filename = splitPath[1];

      const data: IData = {
         filename,
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
      Object.entries(categoriesCommonConfig).filter(([key]) =>
         categoriesToUse.includes(key),
      ),
   );

   const mergedAssets: IAssets = {};
   _merge(mergedAssets, generatedDataFromAssets, filteredCommonConfig);

   const assets = Object.fromEntries(
      Object.entries(mergedAssets).sort(
         (x, y) => (x as any)[1].order - (y as any)[1].order,
      ),
   );

   return assets;
};
