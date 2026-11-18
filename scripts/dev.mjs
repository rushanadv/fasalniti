import {spawn} from 'node:child_process';import {existsSync} from 'node:fs';
for(const file of ['.env.local','.env'])if(existsSync(file))process.loadEnvFile(file);
const children=[];let ending=false;
function stop(code=0){if(ending)return;ending=true;for(const child of children)child.kill('SIGTERM');process.exitCode=code}
function launch(args){const child=spawn(process.execPath,args,{stdio:'inherit'});children.push(child);child.on('exit',code=>stop(code??0));return child}
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>stop());
launch(['--watch','--import','tsx','server/index.ts']);
let ready=false;
for(let attempt=0;attempt<100&&!ending;attempt++){try{const response=await fetch(`http://127.0.0.1:${process.env.API_PORT||8787}/api/health`,{signal:AbortSignal.timeout(250)});if(response.ok){ready=true;break}}catch{}await new Promise(r=>setTimeout(r,100))}
if(ready&&!ending)launch(['node_modules/vite/bin/vite.js','--host','127.0.0.1']);else if(!ending){console.error('Backend did not become ready; frontend was not started.');stop(1)}
