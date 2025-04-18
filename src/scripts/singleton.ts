import { NS, ProcessInfo } from './types/ns.d';

export const singleton = (ns: NS): void =>
  ns
    .ps('home')
    .filter((ps: ProcessInfo) => ps.filename === ns.self().filename && ps.pid !== ns.pid)
    .forEach((ps: ProcessInfo) => ns.kill(ps.pid));