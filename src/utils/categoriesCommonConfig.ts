import { ICommonConfig } from '../types';

const colorCombinations = [
  [0x949398, 0xf4df4e],
  [0xfc766a, 0x5b84b1],
  [0x5f4b8b, 0xe69a8d],
  [0x000000, 0xffffff],
  [0x00203f, 0xadefd1],
  [0x606060, 0xd6ed17],
  [0x00539c, 0xeea47f],
  [0x101820, 0xfee715],
  [0x101820, 0xf2aa4c],
  [0x2d2926, 0xe94b3c],
  [0xffd662, 0x00539c],
  [0x1c1c1b, 0xce4a7e],
];

function shuffledColors() {
  for (let i = colorCombinations.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [colorCombinations[i], colorCombinations[j]] = [colorCombinations[j], colorCombinations[i]];
  }
}

export const initialColor = 0x000000;
export const categoriesCommonConfig: ICommonConfig = {
  intro: {
    textColor: initialColor,
    outlineTextColor: initialColor,
    bgColor: 0xffffff,
    tintColor: initialColor,
    order: 1,
  },
  experience: {
    name: 'EXPERIENCE',
    textColor: 0xfee715,
    bgColor: 0x101820,
    tintColor: 0x101820,
    order: 2,
  },
  projects: {
    name: 'PROJECTS',
    textColor: 0xffd662,
    bgColor: 0x00539c,
    tintColor: 0x00539c,
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
