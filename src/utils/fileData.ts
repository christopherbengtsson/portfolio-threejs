import { IFileData } from '../types';

import trustly from '../../assets/experience/trustly.png';
import relight from '../../assets/experience/relight.png';
import headlight from '../../assets/experience/headlight.png';
import oru from '../../assets/experience/oru.png';

import portfolio_game from '../../assets/projects/portfolio_game.mp4';
import anna_bot from '../../assets/projects/anna_bot.mp4';

export const fileData: IFileData = {
  experience: {
    [extractFilename(trustly)]: {
      type: 'IMAGE',
      filepath: trustly,
      filename: extractFilename(trustly),
      text: 'Currently working with technologies such as React, Spring, AWS and K8s with a microfrontends and microservices architecture.',
      caption: 'Software engineer 2020 - present',
      link: 'https://trustly.net',
    },
    [extractFilename(relight)]: {
      type: 'IMAGE',
      filepath: relight,
      filename: extractFilename(relight),
      text: 'I was consulting as a frontend/process developer, integrating process-automation and low-code platforms such as K2 and OutSystems with technologies like Angular, SQL server and C#.\nRelight was a subsidiary company to Headlight before being acquired by HiQ.',
      caption: `Software developer 2018 - 2020`,
      link: 'https://relight.se',
    },
    [extractFilename(headlight)]: {
      type: 'IMAGE',
      filepath: headlight,
      filename: extractFilename(headlight),
      text: 'On my last semester at the university I had an internship developing a mobile app using Ionic and Cordova along with two other classmates. After 6 months and a graduation my internship turned into my first full-time job as a software developer.',
      caption: `Software developer 2017 - 2018`,
      link: 'https://news.cision.com/hiq-international/r/hiq-acquires-headlight-group,c3326314',
    },
    [extractFilename(oru)]: {
      type: 'IMAGE',
      filepath: oru,
      filename: extractFilename(oru),
      text: 'I moved from Stockholm to Örebro and studied Informatics Science for 3 years.',
      caption: 'Informatics Science 2014 - 2017',
      link: 'https://www.oru.se/utbildning/program/systemvetenskapliga-programmet/',
    },
  },
  projects: {
    [extractFilename(portfolio_game)]: {
      type: 'VIDEO',
      filepath: portfolio_game,
      filename: extractFilename(portfolio_game),
      caption: 'My ThreeJS "game" portfolio, inspired by Bruno Simon.',
      link: 'https://elegant-bhaskara-46ed95.netlify.app/',
    },
    [extractFilename(anna_bot)]: {
      type: 'VIDEO',
      filepath: anna_bot,
      filename: extractFilename(anna_bot),
      caption: 'Anna, my Crypto bot written in Python.',
      link: 'https://github.com/christopherbengtsson/trading-bot',
    },
  },
};

function extractFilename(path: string) {
  const knownPath = path.match(/.+?(?=assets\/)/)![0];
  return path.replace(knownPath, '').replace('assets/', '').split('/').pop()!;
}
