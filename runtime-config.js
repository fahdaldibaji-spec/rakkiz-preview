(function(){
  const current=window.RAKKIZ_RUNTIME||{};
  window.RAKKIZ_RUNTIME=Object.freeze({
    mode:current.mode||'local',
    apiBase:current.apiBase||'/api',
    authMode:'cookie',
    sameOrigin:true,
    country:'SA',
    locale:'ar-SA',
    timezone:'Asia/Riyadh',
    appVersion:'0.83',
    features:{
      remoteSync:current.features?.remoteSync??false,
      fileUploads:current.features?.fileUploads??false,
      auditLog:current.features?.auditLog??false
    }
  });
})();