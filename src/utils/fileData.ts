import { IFileData } from '../types';

import trustly from '../../assets/experience/trustly.png';
import relight from '../../assets/experience/relight.png';
import headlight from '../../assets/experience/headlight.png';
import oru from '../../assets/experience/oru.png';

import portfolio_game from '../../assets/projects/portfolio_game.mp4';
import anna_bot from '../../assets/projects/anna_bot.mp4';

import me from '../../assets/whoami/me.jpeg';

export const fileData: IFileData = {
  experience: {
    [extractFilename(trustly)]: {
      type: 'IMAGE',
      filepath: trustly,
      filename: extractFilename(trustly),
      text: 'Currently working at Trustly using technologies such as React, Spring, AWS and K8s with a microfrontends and microservices architecture.',
      caption: 'Software engineer 2020 - present',
      link: 'https://trustly.net',
    },
    [extractFilename(relight)]: {
      type: 'IMAGE',
      filepath: relight,
      filename: extractFilename(relight),
      text: 'I was consulting as a frontend/process developer at Relight, integrating process-automation and low-code platforms such as K2 and OutSystems with technologies like Angular, SQL server and C#.\n\nRelight was a subsidiary company to Headlight before being acquired by HiQ.',
      caption: `Software developer 2018 - 2020`,
      link: 'https://relight.se',
    },
    [extractFilename(headlight)]: {
      type: 'IMAGE',
      filepath: headlight,
      filename: extractFilename(headlight),
      text: 'On my last semester at the university I had an internship on a consultant firm called Headlight where I was developing a mobile app using Ionic and Cordova along with two other classmates. After 6 months and a graduation my internship turned into my first full-time job as a software developer.',
      caption: `Software developer 2017 - 2018`,
      link: 'https://news.cision.com/hiq-international/r/hiq-acquires-headlight-group,c3326314',
    },
    [extractFilename(oru)]: {
      type: 'IMAGE',
      filepath: oru,
      filename: extractFilename(oru),
      text: 'I moved from Stockholm to Örebro and studied Informatics Science for 3 years. The technical part of the program was C# and .NET heavy but it also covered Java, SQL, HTML/CSS and, lo and behold, JQuery (yes, not just vanilla JS...).\nThe other part of the program included stuff like agile methods, modeling languages and interaction design.\n\nIn parallell to my studies I worked at a fashion store called Volt.',
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
  whoami: {
    [extractFilename(me)]: {
      type: 'IMAGE',
      filepath: me,
      filename: extractFilename(me),
      caption: 'BIO',
      text: `Christopher Bengtsson is a ${
        new Date().getFullYear() - new Date('1993-07-06').getFullYear()
      } yo beer loving intovert from Stockholm living in Gothenburg with his girlfriend and son. He spend his free time coding stuff he never finish and he periodically work out at the gym.\n\nHe enjoy working in a smaller team, tightly with his collegues. He partically thrive when he's in the zone - when it's clear what to do and when there's a full backlog`,
    },
  },
};

function extractFilename(path: string) {
  const knownPath = path.match(/.+?(?=assets\/)/)![0];
  return path.replace(knownPath, '').replace('assets/', '').split('/').pop()!;
}
