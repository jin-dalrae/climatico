import { handleApi } from './api';
import assets from './assets.generated';
export default {async fetch(request:Request,env:{MODEL_API_KEY?:string}){
 const path=new URL(request.url).pathname;
 if(path.startsWith('/api/'))return handleApi(request,env);
 if(request.method!=='GET'&&request.method!=='HEAD')return new Response('Method not allowed',{status:405});
 const entry=assets[path==='/'?'/index.html':path];
 if(!entry)return new Response('Not found',{status:404});
 return new Response(request.method==='HEAD'?null:entry.body,{headers:{'Content-Type':entry.type,'Cache-Control':path.startsWith('/assets/')?'public, max-age=31536000, immutable':'no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self'; worker-src 'self' blob:; frame-ancestors 'self' https://chatgpt.com https://*.chatgpt.com"}});
}};
