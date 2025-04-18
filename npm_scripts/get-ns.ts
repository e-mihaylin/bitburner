// @ts-ignore
import wget from 'node-wget';

 wget({
   url: 'https://raw.github.com/bitburner-official/bitburner-src/dev/src/ScriptEditor/NetscriptDefinitions.d.ts',
   dest: 'src/scripts/types/ns.d.ts',
 });
