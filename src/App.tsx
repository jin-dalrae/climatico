import { Component, Suspense, lazy, useEffect, useState, type ReactNode } from 'react';
import type { CameraAction } from './World';
const World=lazy(()=>import('./World'));
class SceneBoundary extends Component<{children:ReactNode},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return {failed:true}};render(){return this.state.failed?<div className='scene-fallback'><p>The 3D scene could not start. Enable hardware acceleration and reload.</p></div>:this.props.children}}
export default function App(){
 const [selected,setSelected]=useState<string|null>(null),[playing,setPlaying]=useState(true),[reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches),[action,setAction]=useState<CameraAction>({kind:'home',seq:0});
 useEffect(()=>{const preference=matchMedia('(prefers-reduced-motion: reduce)'),change=()=>setReduced(preference.matches);preference.addEventListener('change',change);const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){setSelected(null);setAction(a=>({kind:'home',seq:a.seq+1}))}if(e.code==='Space'){e.preventDefault();setPlaying(p=>!p)}};window.addEventListener('keydown',key);return()=>{preference.removeEventListener('change',change);window.removeEventListener('keydown',key)}},[]);
 return <main className='immersive-scene' aria-label='Climatico interactive business landscape'><SceneBoundary><Suspense fallback={<div className='immersive-loading' aria-label='Loading 3D scene'><span/></div>}><World selected={selected} onSelect={setSelected} day={6} playing={playing} reduced={reduced} connections filter='all' action={action} traceRoot={selected}/></Suspense></SceneBoundary></main>;
}
