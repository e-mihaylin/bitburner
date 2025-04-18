import { NS } from './types/ns.d';

export const main = async (ns: NS): Promise<void> => {
  const store: boolean = true; // ToDo: avoid flag, decide in player
  const homeRam: number = ns.getServerMaxRam('home');

  if (!ns.args[0]) {
    ns.run('/scripts/killall.ts');
  }

  ns.run('/scripts/player.ts');

  if (!store) {
    ns.run('/scripts/purchase.js');
    ns.run('/scripts/hacknet.js');
  }

  if (homeRam > 32) {
    ns.run('/scripts/market.js');
  }

  if (homeRam > 64) {
    ns.run('/scripts/go.js');
    ns.run('/scripts/gang.js');
  }

  if (homeRam > 128) {
    ns.run('/scripts/hashes.js');
    ns.run('/scripts/analyze.js'); // ToDo: move to scan?
    ns.run('/scripts/hud.js');
    ns.run('/scripts/search.js'); // ToDo: move to scan?
    ns.run('/scripts/share.js');
  }

  ns.run('/scripts/attack.js');
  // ns.run('/scripts/attack-simple.ts'); // ToDo: fix simple, run batch
};