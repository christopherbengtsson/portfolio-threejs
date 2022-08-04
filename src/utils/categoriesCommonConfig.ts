import { ICommonConfig } from '../types';

export const initialColor = 0x1b42d8;
export const categoriesCommonConfig: ICommonConfig = {
  intro: {
    textColor: initialColor,
    outlineTextColor: initialColor,
    bgColor: 0xaec7c3,
    tintColor: initialColor,
    order: 1,
  },
  experience: {
    name: 'EXPERIENCE',
    textColor: 0xfd6f53,
    bgColor: 0x012534,
    tintColor: 0x012534,
    order: 2,
  },
  projects: {
    name: 'PROJECTS',
    textColor: 0xf7cf7e,
    bgColor: 0x428884,
    tintColor: 0x428884,
    order: 3,
  },
  end: {
    textColor: 0xed859c,
    outlineTextColor: 0xb9b4e8,
    bgColor: 0x416863,
    tintColor: 0xb9b4e8,
    order: 4,
  },
};
