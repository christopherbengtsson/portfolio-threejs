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
      caption: 'NFT caption in education seciton',
      link: '',
    },
  },
  experience: {
    'nft_carbon.png': {
      caption: 'NFT caption in experience seciton',
      link: '',
    },
  },
};
