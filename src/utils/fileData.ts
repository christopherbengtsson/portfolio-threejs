export interface IFileData {
   [category: string]: {
      [filename: string]: {
         caption: string;
         link: string;
      };
   };
}

export const fileData: IFileData = {
   education: {
      'nft_carbon.png': {
         caption: 'Some awesome text',
         link: '',
      },
   },
};
