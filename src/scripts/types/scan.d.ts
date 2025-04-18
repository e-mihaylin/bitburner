import { Server } from './ns.d';

export interface Target extends Server {
  security: number;
  securityMin: number;
  moneyAvailable: number;
  moneyMax: number;
  hackPart: number;
  hackPartMax: number;
  hackChance: number;
  hackChanceMax: number;
  timeWeaken: number;
  timeGrow: number;
  timeHack: number;
  timeTotal: number;
  score: number;
  probability: number;
  weight: number;
}
