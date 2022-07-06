export interface ICommonConfig {
   [key: string]: {
      name: string;
      textColor: number;
      bgColor: number;
      tintColor: number;
   };
}

export const categoriesCommonConfig: ICommonConfig = {
   education: {
      name: 'EDUCATION',
      textColor: 0x37382e,
      bgColor: 0xfa9e00,
      tintColor: 0x373830,
   },
};
