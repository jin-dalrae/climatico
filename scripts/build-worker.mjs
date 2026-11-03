import {readdir,readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {build} from 'esbuild';
const assets={};
async function collect(folder,prefix=''){for(const f of await readdir(folder,{withFileTypes:true})){const relative=prefix+'/'+f.name;if(f.isDirectory())await collect(folder+'/'+f.name,relative);else{const type=f.name.endsWith('.js')?'text/javascript; charset=utf-8':f.name.endsWith('.css')?'text/css; charset=utf-8':f.name.endsWith('.svg')?'image/svg+xml':f.name.endsWith('.html')?'text/html; charset=utf-8':'text/plain';assets[relative]={type,body:await readFile(folder+'/'+f.name,'utf8')};}}}
await collect('dist/client');
await writeFile('worker/assets.generated.ts','export default '+JSON.stringify(assets)+' as Record<string,{type:string;body:string}>;\n');
await mkdir('dist/server',{recursive:true});
await build({entryPoints:['worker/index.ts'],outfile:'dist/server/index.js',bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true,sourcemap:'external'});
await mkdir('dist/.openai',{recursive:true});
await copyFile('.openai/hosting.json','dist/.openai/hosting.json');
console.log('Packaged server-side Meta API and '+Object.keys(assets).length+' client assets.');
