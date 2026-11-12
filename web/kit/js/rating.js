// "Enjoying the game?" Asks for a store rating at a happy moment, politely and rarely.
// The player can say OK, Not now, or Never ask me again. State lives in the save under `rating`.
//   shouldAskRating(save, { wins })  → true when it's a good time to show the question
//   answerRating(save, 'ok' | 'later' | 'never')  → records the answer; 'ok' opens the store's own rating sheet
// In the store apps this needs an in-app review plugin (for example @capacitor-community/in-app-review).
// Without one, 'ok' does nothing visible, so the question is only shown when canRate() is true.
import { plugin, isNative, devMode } from './native.js';

const DAY = 86400000, WAIT_DAYS = 21, MIN_WINS = 6, MAX_ASKS = 3;
const reviewPlugin = () => plugin('InAppReview') || plugin('RateApp');
export const canRate = () => (isNative && !!reviewPlugin()) || devMode;      // test mode shows it so it can be tried
export function shouldAskRating(save, { wins=0 }={}){
  const r = save.data.rating || {};
  if (!canRate() || r.never || r.done || wins < MIN_WINS || (r.asks||0) >= MAX_ASKS) return false;
  return !r.last || Date.now() - r.last > WAIT_DAYS*DAY;
}
export async function answerRating(save, answer){
  const r = save.data.rating = { asks:0, ...(save.data.rating||{}) };
  r.asks++; r.last = Date.now();
  if (answer==='never') r.never = true;
  if (answer==='ok'){ r.done = true; try { const P = reviewPlugin(); if (P) await (P.requestReview ? P.requestReview() : P.requestReview()); } catch(e) {} }
  save.commit();
}
