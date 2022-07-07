export interface ICommonConfig {
  [key: string]: {
    name?: string;
    textColor: number;
    bgColor: number;
    tintColor: number;
    outlineTextColor?: number;
    order: number;
  };
}

export const categoriesCommonConfig: ICommonConfig = {
  intro: {
    textColor: 0x1b42d8,
    bgColor: 0xaec7c3,
    tintColor: 0x1b42d8,
    outlineTextColor: 0x1b42d8,
    order: 1,
  },
  education: {
    name: 'EDUCATION',
    textColor: 0xfd6f53,
    bgColor: 0x012534,
    tintColor: 0x012534,
    order: 2,
  },
  experience: {
    name: 'EXPERIENCE',
    textColor: 0x37382e,
    bgColor: 0xfa9e00,
    tintColor: 0x373830,
    order: 3,
  },
  end: {
    textColor: 0xf81b06,
    bgColor: 0xf2f2f2,
    tintColor: 0xa2a2a2,
    outlineTextColor: 0xa2a2a2,
    order: 4,
  },
};
