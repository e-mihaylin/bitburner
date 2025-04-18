import { NS, Server } from './types/ns.d';
import { Target } from './types/scan.d';
import { getItem } from './storage';
import { scripts } from './scripts';

export const main = async (ns: NS): Promise<void> => {
  ns.toast(`Running simple autoattack`);

  const silent: boolean = true;
  const reservedHomeRam: number = 64;

  let sleepTime: number = 200;
  while (true) {
    try {
      // const attackers: Server[] = getItem('attackers') || [];
      const attackers: Server[] = getItem('purchased') || [];
      // ns.tprint('attackers ', attackers);
      for (const attacker of attackers) {
        const targets: Target[] = getItem('targets') || [];
        const target: Target = getWeightedTarget(targets);
        // ns.tprint(target);
        const attackerHost: string = attacker.hostname;
        const targetHost: string = target.hostname;
        const isHome: boolean = attackerHost === 'home';
        const maxRam: number = ns.getServerMaxRam(attackerHost) -
          (isHome ? ns.getServerMaxRam('home') > reservedHomeRam ? reservedHomeRam : 0 : 0);
        const ramAvailable: number = Math.max(maxRam - ns.getServerUsedRam(attackerHost), 0);
        const ramPerThread: number = ns.getScriptRam(scripts[0]);
        const maxThreads: number = Math.floor(ramAvailable / ramPerThread);
        if (maxThreads > 0) {
          const moneyThreshold: number = ns.getServerMaxMoney(targetHost) * 0.75;
          const securityThreshold: number = ns.getServerMinSecurityLevel(targetHost) + 5;
          if (ns.getServerSecurityLevel(targetHost) > securityThreshold) {
            const weakenAmount: number = target.security - target.securityMin;
            const weakenPerThread: number = ns.weakenAnalyze(1, attacker.cpuCores);
            const weakenThreads: number = Math.ceil(weakenAmount / weakenPerThread);
            const threads: number = Math.min(maxThreads, weakenThreads);
            threads > 0 && ns.exec(scripts[0], attackerHost, threads, targetHost);
            sleepTime = Math.min(sleepTime, ns.getWeakenTime(targetHost));
            if (!silent) ns.toast(`Running weaken on attacker: ${attackerHost}, target ${targetHost}, threads ${threads}`);
          } else if (ns.getServerMoneyAvailable(targetHost) < moneyThreshold) {
            const targetGrowthMultiplier: number = target.moneyMax / (target.moneyAvailable || 0.01);
            const growThreads: number = Math.ceil(ns.growthAnalyze(targetHost, targetGrowthMultiplier, attacker.cpuCores));
            const threads: number = Math.min(maxThreads, growThreads);
            threads > 0 && ns.exec(scripts[1], attackerHost, threads, targetHost);
            sleepTime = Math.min(sleepTime, ns.getGrowTime(targetHost));
            if (!silent) ns.toast(`Running grow on attacker: ${attackerHost}, target ${targetHost}, threads ${threads}`);
          } else {
            const targetHackAmount: number = target.moneyAvailable - moneyThreshold;
            const hackThreads: number = Math.ceil(ns.hackAnalyzeThreads(targetHost, targetHackAmount));
            const threads: number = Math.min(maxThreads, hackThreads);
            threads > 0 && ns.exec(scripts[2], attackerHost, threads, targetHost);
            sleepTime = Math.min(sleepTime, ns.getHackTime(targetHost));
            if (!silent) ns.toast(`Running hack on attacker: ${attackerHost}, target ${targetHost}, threads ${threads}`);
          }
        }
      }
      await ns.sleep(sleepTime);
    } catch (error) {
      ns.tprint(`error, attack-simple.ts, ${error}`);
    }
  }
}

const getWeightedTarget = (targets: Target[]) => {
  const random: number = Math.random();
  const weightedRandomIndex: number = targets.findIndex(target => random <= target.weight);
  return targets[weightedRandomIndex];
}