import { IFileData } from '../types';

import shapes from '../../assets/education/shapes.jpg';
import arch from '../../assets/education/arch.jpeg';
import code from '../../assets/education/code.jpeg';
import parts from '../../assets/education/parts.jpeg';
import walking from '../../assets/education/walking.jpeg';

import trustly from '../../assets/experience/trustly.png';
import relight from '../../assets/experience/relight.png';
import headlight from '../../assets/experience/headlight.png';
import oru from '../../assets/experience/oru.png';

export const fileData: IFileData = {
  education: {
    [extractFilename(shapes)]: {
      type: 'FILE',
      filepath: shapes,
      filename: extractFilename(shapes),
      caption: 'Some shapes',
      link: 'https://google.se',
    },
    [extractFilename(walking)]: {
      type: 'FILE',
      filepath: walking,
      filename: extractFilename(walking),
      caption: 'Walking people',
      link: 'https://google.se',
    },
    [extractFilename(arch)]: {
      type: 'FILE',
      filepath: arch,
      filename: extractFilename(arch),
      caption: 'Some architecture',
      link: 'https://google.se',
    },
    [extractFilename(code)]: {
      type: 'FILE',
      filepath: code,
      filename: extractFilename(code),
      caption: 'Random code',
      link: 'https://google.se',
    },
    [extractFilename(parts)]: {
      type: 'FILE',
      filepath: parts,
      filename: extractFilename(parts),
      caption: 'Random parts',
      link: 'https://google.se',
    },
  },
  experience: {
    [extractFilename(trustly)]: {
      type: 'FILE',
      filepath: trustly,
      filename: extractFilename(trustly),
      caption: 'Software engineer 2020 - present',
      link: 'https://google.se',
    },
    [extractFilename(relight)]: {
      type: 'FILE',
      filepath: relight,
      filename: extractFilename(relight),
      caption: `Software developer 2018 - 2020`,
      link: 'https://google.se',
    },
    [extractFilename(headlight)]: {
      type: 'FILE',
      filepath: headlight,
      filename: extractFilename(headlight),
      caption: `Software developer 2017 - 2018`,
      link: 'https://google.se',
    },
    [extractFilename(oru)]: {
      type: 'FILE',
      filepath: oru,
      filename: extractFilename(oru),
      caption: 'Informatics Science 2014 - 2017',
      link: 'https://google.se',
    },
    // skills_sphere: {
    //   getComponent: 'wordsSphere',
    // },
    // [extractFilename(drop)]: {
    //   filepath: drop,
    //   filename: extractFilename(drop),
    //   caption: 'drop',
    //   link: 'https://google.se',
    // },
    // [extractFilename(desert)]: {
    //   filepath: desert,
    //   filename: extractFilename(desert),
    //   caption: 'A desert',
    //   link: 'https://google.se',
    // },
    // [extractFilename(nature)]: {
    //   filepath: nature,
    //   filename: extractFilename(nature),
    //   caption: 'Some... nature',
    //   link: 'https://google.se',
    // },
    // [extractFilename(woman)]: {
    //   filepath: woman,
    //   filename: extractFilename(woman),
    //   caption: 'Woman walking a dog',
    //   link: 'https://google.se',
    // },
    // [extractFilename(water)]: {
    //   filepath: water,
    //   filename: extractFilename(water),
    //   caption: 'A waterfall',
    //   link: 'https://google.se',
    // },
  },
};

function extractFilename(path: string) {
  const knownPath = path.match(/.+?(?=assets\/)/)![0];
  return path.replace(knownPath, '').replace('assets/', '').split('/').pop()!;
}
