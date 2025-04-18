import { NS } from './types/ns';

export const main = async (ns: NS): Promise<void> => {
  ns.toast('Running autopilot');
  const interval: number = 10000;

  while (true) {
    ns.run('/scripts/scan.js');
    await ns.sleep(interval);
  }
}