import { NS } from './types/ns.d';

export const main = async (ns: NS): Promise<void> => {
  ns.killall('home');
  // ToDo: recursive kill all on all attackers
  ns.run('/scripts/startup.ts', 1, 1);
};