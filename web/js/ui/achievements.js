// Tracks achievement progress from game events and celebrates unlocks with a toast.
import { G } from '../engine/game.js';
import { ACHIEVEMENTS } from '../data/achievements.js';
import { Save } from '../save.js';
import { on } from '../../kit/js/events.js';
import { Audio } from '../../kit/js/audio.js';
import { toast } from '../../kit/js/fx.js';

const TROPHY = '<span class="t-icon" aria-hidden="true">★</span>';

export const achievementCount = () => ACHIEVEMENTS.filter(a => Save.data.ach[a.id]).length;
export const progressOf = a => a.stat ? Math.min(a.goal, Save.data.stats[a.stat]||0) : null;

function unlock(a){
  const d = new Date();   // the player's own calendar day, not UTC
  Save.data.ach[a.id] = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  Save.commit();
  Audio.play('sparkle');
  toast(`${TROPHY}<span><small>Achievement unlocked</small><b>${a.name}</b></span>`, { kind:'ach', ms:7000 });
}
function evaluate(e){
  for (const a of ACHIEVEMENTS){
    if (Save.data.ach[a.id]) continue;
    const ok = a.stat ? (Save.data.stats[a.stat]||0) >= a.goal : a.check(Save.data, e);
    if (ok) unlock(a);
  }
}
const bump = (stat, n=1) => { Save.data.stats[stat] = (Save.data.stats[stat]||0) + n; };

export function initAchievements(){
  on('kill', ({ boss }) => { bump('kills'); if (boss){ bump('bossKills'); evaluate({ type:'boss' }); } });
  on('waveClear', ({ fromFlowers }) => { if (fromFlowers){ bump('flowerSeeds', fromFlowers); } Save.commit(); evaluate({ type:'wave' }); });
  on('plant', () => evaluate({ type:'plant', count:G.S.towers.length }));
  on('upgrade', t => evaluate({ type:'upgrade', lv:t.lv }));
  on('fence', () => evaluate({ type:'fence' }));
  on('perk', () => evaluate({ type:'perk' }));
  // win runs after the UI has saved the new stars, so garden-wide checks see them
  on('win', w => setTimeout(() => evaluate({ type:'win', lost:w.lost, speed:G.S.speed }), 600));
  on('lose', () => Save.commit());
}

// "2026-11-10" → "Nov 10, 2026", in the player's language.
export function niceDate(iso){
  const [y,m,d] = String(iso).split('-').map(Number);
  if (!y || !m || !d) return '';
  return new Date(y, m-1, d).toLocaleDateString(undefined, { month:'short', day:'numeric', year:'numeric' });
}
