import { IFileData } from '../types';

import trustly from '../../assets/experience/trustly.png';
import relight from '../../assets/experience/relight.png';
import headlight from '../../assets/experience/headlight.png';
import oru from '../../assets/experience/oru.png';

import portfolio_game from '../../assets/projects/portfolio_game.mp4';
import anna_bot from '../../assets/projects/anna_bot.mp4';

import me from '../../assets/whoami/me.jpeg';
import rolex from '../../assets/whoami/rolex.png';

const elById = (id: string) => document.getElementById(id)!.textContent!;
const linkById = (id: string) => document.getElementById(id)?.getAttribute('href')!;

export const fileData: IFileData = {
  experience: {
    [extractFilename(trustly)]: {
      type: 'IMAGE',
      filepath: trustly,
      filename: extractFilename(trustly),
      text: elById('text_trustly'),
      caption: elById('caption_trustly'),
      link: linkById('link_trustly'),
    },
    [extractFilename(relight)]: {
      type: 'IMAGE',
      filepath: relight,
      filename: extractFilename(relight),
      text: elById('text_relight'),
      caption: elById('caption_relight'),
      link: linkById('link_relight'),
    },
    [extractFilename(headlight)]: {
      type: 'IMAGE',
      filepath: headlight,
      filename: extractFilename(headlight),
      text: elById('text_headlight'),
      caption: elById('caption_headlight'),
      link: linkById('link_headlight'),
    },
    [extractFilename(oru)]: {
      type: 'IMAGE',
      filepath: oru,
      filename: extractFilename(oru),
      text: elById('text_oru'),
      caption: elById('caption_oru'),
      link: linkById('link_oru'),
    },
  },
  projects: {
    [extractFilename(portfolio_game)]: {
      type: 'VIDEO',
      filepath: portfolio_game,
      filename: extractFilename(portfolio_game),
      caption: elById('caption_game'),
      link: linkById('link_game'),
    },
    [extractFilename(anna_bot)]: {
      type: 'VIDEO',
      filepath: anna_bot,
      filename: extractFilename(anna_bot),
      caption: elById('caption_anna'),
      link: linkById('link_anna'),
    },
  },
  whoami: {
    [extractFilename(me)]: {
      type: 'IMAGE',
      filepath: me,
      filename: extractFilename(me),
      caption: elById('caption_bio'),
      text: elById('text_bio'),
    },
    [extractFilename(rolex)]: {
      type: 'IMAGE',
      filepath: rolex,
      caption: elById('caption_watches'),
      text: elById('text_watches'),
      filename: extractFilename(rolex),
      link: linkById('link_watches'),
    },
  },
};

function extractFilename(path: string) {
  const knownPath = path.match(/.+?(?=assets\/)/)![0];
  return path.replace(knownPath, '').replace('assets/', '').split('/').pop()!;
}
