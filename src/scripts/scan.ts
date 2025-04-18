import { NS, Server } from './types/ns.d';
import { Target } from './types/scan.d';
import { setItem } from './storage';
import { scripts } from './scripts';

export const main = async (ns: NS): Promise<void> => {
  ns.toast(`Running targets scan`);

  const hosts: string[] = getHosts(ns);
  const targets: Server[] = getTargets(ns, hosts);
  const attackers: Server[] = getAttackers(ns, hosts);
  const purchased: Server[] = getPurchased(ns, hosts);

  // ns.tprint('hosts ', hosts);
  // ns.tprint('targets ', targets);
  // ns.tprint('attackers ', attackers);
  // ns.tprint('purchased ', purchased);

  setItem('hosts', hosts);
  setItem('targets', targets);
  setItem('attackers', attackers);
  setItem('purchased', purchased);
};

const getHosts = (ns: NS): string[] => {
  const hosts: Record<string, string> = {};
  const stack: string[] = ['home'];

  while (stack.length) {
    const node: string = stack.shift()!;
    if (!hosts[node]) {
      hosts[node] = node;
      for (const child of ns.scan(node)) {
        if (!hosts[child]) {
          stack.push(child);
        }
      }
    }
  }

  return Object.keys(hosts);
};

const getTargets = (ns: NS, hosts: string[], weigth: boolean = true): Target[] => {
  const targets: Target[] = hosts
    .filter((host) => canPenetrate(ns, host) && canHack(ns, host) && ns.getServer(host).moneyMax)
    .map((host) => {
      if (!ns.hasRootAccess(host)) getRoot(ns, host);
      return analyzeServer(ns, host);
    })
    .sort((x: Target, y: Target) => x.score - y.score);

  if (!weigth) return targets;
  const scoreSum: number = targets.reduce((sum, target) => sum + target.score, 0);
  let prev: number = 0;
  return targets.map((target: Target) => {
    target.probability = target.score / scoreSum;
    const sum: number = target.probability + prev;
    prev = sum;
    target.weight = sum;
    return target;
  });
};

const getAttackers = (ns: NS, hosts: string[]) =>
  hosts
    .filter((host: string) => canPenetrate(ns, host) && ns.getServerMaxRam(host))
    .map((host: string) => {
      if (!ns.hasRootAccess(host)) getRoot(ns, host);
      if (!ns.fileExists(scripts[0], host)) ns.scp(scripts, host);
      return ns.getServer(host);
    });

const getPurchased = (ns: NS, hosts: string[]) =>
  ['home'].concat(hosts.filter((host) => host.startsWith('s-'))).map((host: string) => {
    if (!ns.fileExists(scripts[0], host)) ns.scp(scripts, host);
    return ns.getServer(host);
  });

const canPenetrate = (ns: NS, host: string) => getCracksCount(ns) >= ns.getServerNumPortsRequired(host);

const getCracksCount = (ns: NS, homeServer = 'home') =>
  Object.keys(getCracks(ns)).filter((file) => ns.fileExists(file, homeServer)).length;

const getCracks = (ns: NS) => ({
  'BruteSSH.exe': ns.brutessh,
  'FTPCrack.exe': ns.ftpcrack,
  'relaySMTP.exe': ns.relaysmtp,
  'HTTPWorm.exe': ns.httpworm,
  'SQLInject.exe': ns.sqlinject,
});

const getRoot = (ns: NS, host: string) => {
  if (ns.getServerNumPortsRequired(host)) penetrate(ns, host);
  ns.toast(`Gaining root access on ${host}`);
  ns.nuke(host);
};

const penetrate = (ns: NS, host: string) => {
  ns.toast(`Penetrating ${host}`);
  const cracks: Record<string, (host: string) => boolean> = {
    'BruteSSH.exe': ns.brutessh,
    'FTPCrack.exe': ns.ftpcrack,
    'relaySMTP.exe': ns.relaysmtp,
    'HTTPWorm.exe': ns.httpworm,
    'SQLInject.exe': ns.sqlinject,
  };
  for (const [key, value] of Object.entries(cracks)) {
    if (ns.fileExists(key, 'home')) {
      value(host);
    }
  }
};

const canHack = (ns: NS, host: string) => ns.getHackingLevel() >= ns.getServerRequiredHackingLevel(host);

const analyzeServer = (ns: NS, host: string): Target => {
  const server: Target = ns.getServer(host) as Target;
  const { hostname, moneyAvailable, moneyMax } = server;
  const [securityMin, security] = [ns.getServerMinSecurityLevel(hostname), ns.getServerSecurityLevel(hostname)];

  const isMinSecurity: boolean = security === securityMin;
  const isMoneyMax: boolean = moneyAvailable === moneyMax;
  let hackChanceMaxMemo;
  let hackPartMaxMemo;
  if (isMinSecurity) {
    hackChanceMaxMemo = ns.hackAnalyzeChance(hostname);
    hackPartMaxMemo = ns.hackAnalyze(hostname);
  }

  const hackPart = ns.hackAnalyze(hostname);
  const hackPartMax = hackPartMaxMemo || hackPart;

  const hackChance = ns.hackAnalyzeChance(hostname);
  const hackChanceMax = hackChanceMaxMemo || hackChance;

  const timeWeaken = ns.getWeakenTime(hostname);
  const timeGrow = ns.getGrowTime(hostname);
  const timeHack = ns.getHackTime(hostname);
  const timeTotal = (isMinSecurity ? 0 : timeWeaken) + (isMoneyMax ? 0 : timeGrow) + timeHack;

  const score = (moneyMax! * hackPartMax * hackChanceMax * 1000) / timeTotal;

  return {
    ...server,
    securityMin,
    security,
    hackPart,
    hackPartMax,
    hackChance,
    hackChanceMax,
    timeWeaken,
    timeGrow,
    timeHack,
    timeTotal,
    score,
  };
};