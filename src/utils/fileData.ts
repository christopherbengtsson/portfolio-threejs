import { IFileData } from '../types';

import trustly from '../../assets/experience/trustly.png';
import relight from '../../assets/experience/relight.png';
import headlight from '../../assets/experience/headlight.png';
import oru from '../../assets/experience/oru.png';

export const fileData: IFileData = {
  experience: {
    [extractFilename(trustly)]: {
      type: 'FILE',
      filepath: trustly,
      filename: extractFilename(trustly),
      text: 'Currently with technologies such as React, Spring, AWS and K8s with a microfrontend and microservice architecture.',
      caption: 'Software engineer 2020 - present',
      link: 'https://trustly.net',
    },
    [extractFilename(relight)]: {
      type: 'FILE',
      filepath: relight,
      filename: extractFilename(relight),
      text: 'I was consulting as a frontend/process developer, integrating process-automation and low-code platforms such as K2 and OutSystems with technoligies like Angular, SQL server and C#.\nRelight was a subsidiary company to Headlight before being acquired by HiQ.',
      caption: `Software developer 2018 - 2020`,
      link: 'https://relight.se',
    },
    [extractFilename(headlight)]: {
      type: 'FILE',
      filepath: headlight,
      filename: extractFilename(headlight),
      text: 'On my last semester at the university I had an internship developing an mobile app using Ionic and Cordova along with two other classmates. After 6 months and a graduation my internship turned into my first full-time job as a software developer.',
      caption: `Software developer 2017 - 2018`,
      link: 'https://news.cision.com/hiq-international/r/hiq-acquires-headlight-group,c3326314',
    },
    [extractFilename(oru)]: {
      type: 'FILE',
      filepath: oru,
      filename: extractFilename(oru),
      text: 'I moved from Stockholm to Örebro and studied Informatics Science for 3 years.',
      caption: 'Informatics Science 2014 - 2017',
      link: 'https://www.oru.se/utbildning/program/systemvetenskapliga-programmet/',
    },
  },
};

function extractFilename(path: string) {
  const knownPath = path.match(/.+?(?=assets\/)/)![0];
  return path.replace(knownPath, '').replace('assets/', '').split('/').pop()!;
}
