import { Howl } from 'howler';

export const sfx = {
  click: new Howl({ src: ['/sounds/click.mp3'], volume: 0.5 }),
  success: new Howl({ src: ['/sounds/success.mp3'], volume: 0.5 }),
  error: new Howl({ src: ['/sounds/error.mp3'], volume: 0.5 }),
  coin: new Howl({ src: ['/sounds/coin.mp3'], volume: 0.5 }),
  pop: new Howl({ src: ['/sounds/pop.mp3'], volume: 0.5 }),
};
