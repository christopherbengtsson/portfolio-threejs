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
      link: 'https://google.se',
    },
  },
  experience: {
    'nft_carbon.png': {
      caption: 'NFT caption in experience seciton',
      link: 'https://google.se',
    },
  },
};
