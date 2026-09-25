(function(){
  const cfg=window.RAKKIZ_RUNTIME||{mode:'local',apiBase:'/api'};
  const CACHE_PREFIX='rakkiz_cache:';
  const inflight=new Map();

  function cacheKey(key){return CACHE_PREFIX+key}
  function readRaw(key){
    try{
      const cached=localStorage.getItem(cacheKey(key));
      if(cached!==null)return cached;
      return localStorage.getItem(key);
    }catch{return null}
  }
  function writeRaw(key,value){
    try{
      localStorage.setItem(cacheKey(key),value);
      localStorage.setItem(key,value);
    }catch{}
  }
  async function request(path,options={}){
    const headers=new Headers(options.headers||{});
    if(options.json!==undefined){
      headers.set('Content-Type','application/json');
      options.body=JSON.stringify(options.json);
      delete options.json;
    }
    headers.set('Accept','application/json');
    const res=await fetch((cfg.apiBase||'/api')+path,{
      ...options,
      headers,
      credentials:'include',
      cache:'no-store'
    });
    if(res.status===204)return null;
    const ct=res.headers.get('content-type')||'';
    const body=ct.includes('application/json')?await res.json():await res.text();
    if(!res.ok){
      const err=new Error(body?.message||body||('HTTP '+res.status));
      err.status=res.status;err.body=body;throw err;
    }
    return body;
  }

  async function pushSetting(key,value){
    if(cfg.mode!=='rest')return;
    const task=request('/settings/'+encodeURIComponent(key),{method:'PUT',json:{value}});
    inflight.set(key,task);
    try{await task}finally{if(inflight.get(key)===task)inflight.delete(key)}
  }

  const store={
    get(key){return readRaw(key)},
    set(key,value){
      const raw=typeof value==='string'?value:JSON.stringify(value);
      writeRaw(key,raw);
      if(cfg.mode==='rest')void pushSetting(key,raw);
    },
    remove(key){
      try{localStorage.removeItem(key);localStorage.removeItem(cacheKey(key))}catch{}
      if(cfg.mode==='rest')void request('/settings/'+encodeURIComponent(key),{method:'DELETE'});
    }
  };

  async function hydrate(keys=[]){
    if(cfg.mode!=='rest'||!keys.length)return;
    const qs=new URLSearchParams();keys.forEach(k=>qs.append('key',k));
    try{
      const data=await request('/settings?'+qs.toString());
      const values=data?.values||data||{};
      for(const key of keys){
        if(Object.prototype.hasOwnProperty.call(values,key)){
          const v=typeof values[key]==='string'?values[key]:JSON.stringify(values[key]);
          writeRaw(key,v);
        }
      }
    }catch(err){
      console.warn('[RakkizBackend] settings hydrate failed; cached data will be used.',err);
    }
  }

  const api={
    request,
    health(){return request('/health')},
    session(){return request('/auth/session')},
    logout(){return request('/auth/logout',{method:'POST'})},
    bootstrap(){return request('/bootstrap')},
    mutate(resource,payload,method='POST'){return request('/'+resource,{method,json:payload})},
    async upload(file,meta={}){
      if(cfg.mode!=='rest')throw new Error('رفع الملفات غير مفعل في الوضع المحلي.');
      const form=new FormData();form.append('file',file);
      for(const [k,v] of Object.entries(meta))if(v!==undefined&&v!==null)form.append(k,String(v));
      return request('/files',{method:'POST',body:form});
    }
  };

  window.RakkizBackend=Object.freeze({
    mode:cfg.mode,
    store,
    api,
    ready:hydrate,
    contractVersion:'1'
  });
})();