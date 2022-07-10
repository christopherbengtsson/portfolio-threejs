import { IFileData } from '../types';

import shapes from '../../assets/education/shapes.jpg';
import arch from '../../assets/education/arch.jpeg';
import code from '../../assets/education/code.jpeg';
import parts from '../../assets/education/parts.jpeg';
import walking from '../../assets/education/walking.jpeg';

import drop from '../../assets/experience/drop.jpg';
import desert from '../../assets/experience/desert.jpeg';
import nature from '../../assets/experience/nature.jpeg';
import woman from '../../assets/experience/woman.jpeg';
import water from '../../assets/experience/water.jpeg';

export const fileData: IFileData = {
  education: {
    [extractFilename(shapes)]: {
      filepath: shapes,
      filename: extractFilename(shapes),
      caption: 'Some shapes',
      link: 'https://google.se',
    },
    [extractFilename(walking)]: {
      filepath: walking,
      filename: extractFilename(walking),
      caption: 'Walking people',
      link: 'https://google.se',
    },
    [extractFilename(arch)]: {
      filepath: arch,
      filename: extractFilename(arch),
      caption: 'Some architecture',
      link: 'https://google.se',
    },
    [extractFilename(code)]: {
      filepath: code,
      filename: extractFilename(code),
      caption: 'Random code',
      link: 'https://google.se',
    },
    [extractFilename(parts)]: {
      filepath: parts,
      filename: extractFilename(parts),
      caption: 'Random parts',
      link: 'https://google.se',
    },
  },
  experience: {
    [extractFilename(drop)]: {
      filepath: drop,
      filename: extractFilename(drop),
      caption: 'drop',
      link: 'https://google.se',
    },
    [extractFilename(desert)]: {
      filepath: desert,
      filename: extractFilename(desert),
      caption: 'A desert',
      link: 'https://google.se',
    },
    [extractFilename(nature)]: {
      filepath: nature,
      filename: extractFilename(nature),
      caption: 'Some... nature',
      link: 'https://google.se',
    },
    [extractFilename(woman)]: {
      filepath: woman,
      filename: extractFilename(woman),
      caption: 'Woman walking a dog',
      link: 'https://google.se',
    },
    [extractFilename(water)]: {
      filepath: water,
      filename: extractFilename(water),
      caption: 'A waterfall',
      link: 'https://google.se',
    },
  },
};

function extractFilename(path: string) {
  const knownPath = path.match(/.+?(?=assets\/)/)![0];
  return path.replace(knownPath, '').replace('assets/', '').split('/').pop()!;
}
