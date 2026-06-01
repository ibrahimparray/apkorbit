(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[888],{1118:function(e,t,a){(window.__NEXT_P=window.__NEXT_P||[]).push(["/_app",function(){return a(5148)}])},9548:function(e,t,a){"use strict";a.d(t,{H:function(){return l},a:function(){return c}});var r=a(5893),o=a(7294),s=a(1163),i=a(9307);let n=(0,o.createContext)(null);function l(e){let{children:t}=e,[a,l]=(0,o.useState)(null),[c,u]=(0,o.useState)(!0),d=(0,s.useRouter)(),p=(0,o.useCallback)(async()=>{if(d.pathname.startsWith("/store")){u(!1);return}if(!localStorage.getItem("token")){u(!1),"/login"!==d.pathname&&d.push("/login");return}try{let e=await i.iJ.me();l(e.user),"/login"===d.pathname&&d.push("/")}catch(e){localStorage.removeItem("token"),l(null),"/login"!==d.pathname&&d.push("/login")}finally{u(!1)}},[d]);(0,o.useEffect)(()=>{p()},[p]);let f=async(e,t)=>{let a=await i.iJ.login({email:e,password:t});return a.token&&(localStorage.setItem("token",a.token),l(a.user),d.push("/")),a};return(0,r.jsx)(n.Provider,{value:{user:a,loading:c,login:f,logout:()=>{localStorage.removeItem("token"),l(null),d.push("/login")},checkAuth:p},children:t})}let c=()=>{let e=(0,o.useContext)(n);if(!e)throw Error("useAuth must be used within AuthProvider");return e}},5148:function(e,t,a){"use strict";a.r(t),a.d(t,{default:function(){return l}});var r=a(5893),o=a(9548),s=a(6501),i=a(1163);function n(e){let{Component:t,pageProps:a}=e;return(0,i.useRouter)().pathname,(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(s.x7,{position:"top-right",toastOptions:{className:"!bg-white dark:!bg-surface-800 !text-surface-900 dark:!text-surface-100 !shadow-xl !rounded-2xl !border !border-surface-200 dark:!border-surface-700",duration:3e3}}),(0,r.jsx)(t,{...a})]})}function l(e){let{Component:t,pageProps:a}=e;return(0,r.jsx)(o.H,{children:(0,r.jsx)(n,{Component:t,pageProps:a})})}a(876)},9307:function(e,t,a){"use strict";a.d(t,{S7:function(){return i},Yc:function(){return n},Yu:function(){return l},iJ:function(){return s},pJ:function(){return c}});class r{getToken(){return localStorage.getItem("token")}async request(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},a=this.getToken(),r={"Content-Type":"application/json",...a&&{Authorization:"Bearer ".concat(a)},...t.headers};t.body instanceof FormData&&delete r["Content-Type"];let o={...t,headers:r};try{let t=await fetch("".concat(this.baseUrl).concat(e),o),a=await t.json().catch(()=>null);if(!t.ok)throw{status:t.status,message:(null==a?void 0:a.message)||"An error occurred",data:a};return a}catch(e){if(e.status)throw e;throw{status:0,message:"Network error. Please check your connection."}}}get(e){return this.request(e,{method:"GET"})}post(e,t){let a=t instanceof FormData;return this.request(e,{method:"POST",body:a?t:JSON.stringify(t),...a&&{headers:{}}})}put(e,t){let a=t instanceof FormData;return this.request(e,{method:"PUT",body:a?t:JSON.stringify(t),...a&&{headers:{}}})}delete(e){return this.request(e,{method:"DELETE"})}constructor(){this.baseUrl="http://localhost:5000/api"}}let o=new r,s={login:e=>o.post("/auth/login",e),me:()=>o.get("/auth/me"),updateProfile:e=>o.put("/auth/profile",e),changePassword:e=>o.put("/auth/password",e)},i={list:e=>o.get("/apps?".concat(new URLSearchParams(e))),detail:e=>o.get("/apps/".concat(e)),create:e=>o.post("/apps",e),update:(e,t)=>o.put("/apps/".concat(e),t),delete:e=>o.delete("/apps/".concat(e)),togglePublish:e=>o.put("/apps/".concat(e,"/toggle-publish")),toggleArchive:e=>o.put("/apps/".concat(e,"/toggle-archive")),uploadScreenshots:(e,t)=>o.post("/apps/".concat(e,"/screenshots"),t),uploadVersion:(e,t)=>o.post("/apps/".concat(e,"/versions"),t),latestVersion:e=>o.get("/apps/".concat(e,"/versions/latest")),checkUpdate:e=>o.post("/apps/check-update",e)},n={list:()=>o.get("/categories"),detail:e=>o.get("/categories/".concat(e)),create:e=>o.post("/categories",e),update:(e,t)=>o.put("/categories/".concat(e),t),delete:e=>o.delete("/categories/".concat(e))},l={dashboard:()=>o.get("/analytics/dashboard"),downloads:e=>o.get("/analytics/downloads?".concat(new URLSearchParams(e)))},c={getAll:()=>o.get("/settings"),update:e=>o.put("/settings",e),uploadLogo:e=>o.post("/settings/logo",e),storage:()=>o.get("/settings/storage")}},876:function(){},1163:function(e,t,a){e.exports=a(3079)},6501:function(e,t,a){"use strict";let r,o;a.d(t,{x7:function(){return ep},ZP:function(){return ef}});var s,i=a(7294);let n={data:""},l=e=>{if("object"==typeof window){let t=(e?e.querySelector("#_goober"):window._goober)||Object.assign(document.createElement("style"),{innerHTML:" ",id:"_goober"});return t.nonce=window.__nonce__,t.parentNode||(e||document.head).appendChild(t),t.firstChild}return e||n},c=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,u=/\/\*[^]*?\*\/|  +/g,d=/\n+/g,p=(e,t)=>{let a="",r="",o="";for(let s in e){let i=e[s];"@"==s[0]?"i"==s[1]?a=s+" "+i+";":r+="f"==s[1]?p(i,s):s+"{"+p(i,"k"==s[1]?"":t)+"}":"object"==typeof i?r+=p(i,t?t.replace(/([^,])+/g,e=>s.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,t=>/&/.test(t)?t.replace(/&/g,e):e?e+" "+t:t)):s):null!=i&&(s="-"==s[1]?s:s.replace(/[A-Z]/g,"-$&").toLowerCase(),o+=p.p?p.p(s,i):s+":"+i+";")}return a+(t&&o?t+"{"+o+"}":o)+r},f={},m=e=>{if("object"==typeof e){let t="";for(let a in e)t+=a+m(e[a]);return t}return e},g=(e,t,a,r,o)=>{var s;let i=m(e),n=f[i]||(f[i]=(e=>{let t=0,a=11;for(;t<e.length;)a=101*a+e.charCodeAt(t++)>>>0;return"go"+a})(i));if(!f[n]){let t=i!==e?e:(e=>{let t,a,r=[{}];for(;t=c.exec(e.replace(u,""));)t[4]?r.shift():t[3]?(a=t[3].replace(d," ").trim(),r.unshift(r[0][a]=r[0][a]||{})):r[0][t[1]]=t[2].replace(d," ").trim();return r[0]})(e);f[n]=p(o?{["@keyframes "+n]:t}:t,a?"":"."+n)}let l=a&&f.g;return a&&(f.g=f[n]),s=f[n],l?t.data=t.data.replace(l,s):-1===t.data.indexOf(s)&&(t.data=r?s+t.data:t.data+s),n},h=(e,t,a)=>e.reduce((e,r,o)=>{let s=t[o];if(s&&s.call){let e=s(a),t=e&&e.props&&e.props.className||/^go/.test(e)&&e;s=t?"."+t:e&&"object"==typeof e?e.props?"":p(e,""):!1===e?"":e}return e+r+(null==s?"":s)},"");function y(e){let t=this||{},a=e.call?e(t.p):e;return g(a.unshift?a.raw?h(a,[].slice.call(arguments,1),t.p):a.reduce((e,a)=>Object.assign(e,a&&a.call?a(t.p):a),{}):a,l(t.target),t.g,t.o,t.k)}y.bind({g:1});let b,v,x,w=y.bind({k:1});function k(e,t){let a=this||{};return function(){let r=arguments;function o(s,i){let n=Object.assign({},s),l=n.className||o.className;a.p=Object.assign({theme:v&&v()},n),a.o=/go\d/.test(l),n.className=y.apply(a,r)+(l?" "+l:""),t&&(n.ref=i);let c=e;return e[0]&&(c=n.as||e,delete n.as),x&&c[0]&&x(n),b(c,n)}return t?t(o):o}}var E=e=>"function"==typeof e,C=(e,t)=>E(e)?e(t):e,j=(r=0,()=>(++r).toString()),P=()=>{if(void 0===o&&"u">typeof window){let e=matchMedia("(prefers-reduced-motion: reduce)");o=!e||e.matches}return o},N="default",O=(e,t)=>{let{toastLimit:a}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,a)};case 1:return{...e,toasts:e.toasts.map(e=>e.id===t.toast.id?{...e,...t.toast}:e)};case 2:let{toast:r}=t;return O(e,{type:e.toasts.find(e=>e.id===r.id)?1:0,toast:r});case 3:let{toastId:o}=t;return{...e,toasts:e.toasts.map(e=>e.id===o||void 0===o?{...e,dismissed:!0,visible:!1}:e)};case 4:return void 0===t.toastId?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(e=>e.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let s=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(e=>({...e,pauseDuration:e.pauseDuration+s}))}}},_=[],S={toasts:[],pausedAt:void 0,settings:{toastLimit:20}},$={},D=(e,t=N)=>{$[t]=O($[t]||S,e),_.forEach(([e,a])=>{e===t&&a($[t])})},A=e=>Object.keys($).forEach(t=>D(e,t)),I=e=>Object.keys($).find(t=>$[t].toasts.some(t=>t.id===e)),T=(e=N)=>t=>{D(t,e)},z={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},L=(e={},t=N)=>{let[a,r]=(0,i.useState)($[t]||S),o=(0,i.useRef)($[t]);(0,i.useEffect)(()=>(o.current!==$[t]&&r($[t]),_.push([t,r]),()=>{let e=_.findIndex(([e])=>e===t);e>-1&&_.splice(e,1)}),[t]);let s=a.toasts.map(t=>{var a,r,o;return{...e,...e[t.type],...t,removeDelay:t.removeDelay||(null==(a=e[t.type])?void 0:a.removeDelay)||(null==e?void 0:e.removeDelay),duration:t.duration||(null==(r=e[t.type])?void 0:r.duration)||(null==e?void 0:e.duration)||z[t.type],style:{...e.style,...null==(o=e[t.type])?void 0:o.style,...t.style}}});return{...a,toasts:s}},F=(e,t="blank",a)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...a,id:(null==a?void 0:a.id)||j()}),U=e=>(t,a)=>{let r=F(t,e,a);return T(r.toasterId||I(r.id))({type:2,toast:r}),r.id},H=(e,t)=>U("blank")(e,t);H.error=U("error"),H.success=U("success"),H.loading=U("loading"),H.custom=U("custom"),H.dismiss=(e,t)=>{let a={type:3,toastId:e};t?T(t)(a):A(a)},H.dismissAll=e=>H.dismiss(void 0,e),H.remove=(e,t)=>{let a={type:4,toastId:e};t?T(t)(a):A(a)},H.removeAll=e=>H.remove(void 0,e),H.promise=(e,t,a)=>{let r=H.loading(t.loading,{...a,...null==a?void 0:a.loading});return"function"==typeof e&&(e=e()),e.then(e=>{let o=t.success?C(t.success,e):void 0;return o?H.success(o,{id:r,...a,...null==a?void 0:a.success}):H.dismiss(r),e}).catch(e=>{let o=t.error?C(t.error,e):void 0;o?H.error(o,{id:r,...a,...null==a?void 0:a.error}):H.dismiss(r)}),e};var R=1e3,q=(e,t="default")=>{let{toasts:a,pausedAt:r}=L(e,t),o=(0,i.useRef)(new Map).current,s=(0,i.useCallback)((e,t=R)=>{if(o.has(e))return;let a=setTimeout(()=>{o.delete(e),n({type:4,toastId:e})},t);o.set(e,a)},[]);(0,i.useEffect)(()=>{if(r)return;let e=Date.now(),o=a.map(a=>{if(a.duration===1/0)return;let r=(a.duration||0)+a.pauseDuration-(e-a.createdAt);if(r<0){a.visible&&H.dismiss(a.id);return}return setTimeout(()=>H.dismiss(a.id,t),r)});return()=>{o.forEach(e=>e&&clearTimeout(e))}},[a,r,t]);let n=(0,i.useCallback)(T(t),[t]),l=(0,i.useCallback)(()=>{n({type:5,time:Date.now()})},[n]),c=(0,i.useCallback)((e,t)=>{n({type:1,toast:{id:e,height:t}})},[n]),u=(0,i.useCallback)(()=>{r&&n({type:6,time:Date.now()})},[r,n]),d=(0,i.useCallback)((e,t)=>{let{reverseOrder:r=!1,gutter:o=8,defaultPosition:s}=t||{},i=a.filter(t=>(t.position||s)===(e.position||s)&&t.height),n=i.findIndex(t=>t.id===e.id),l=i.filter((e,t)=>t<n&&e.visible).length;return i.filter(e=>e.visible).slice(...r?[l+1]:[0,l]).reduce((e,t)=>e+(t.height||0)+o,0)},[a]);return(0,i.useEffect)(()=>{a.forEach(e=>{if(e.dismissed)s(e.id,e.removeDelay);else{let t=o.get(e.id);t&&(clearTimeout(t),o.delete(e.id))}})},[a,s]),{toasts:a,handlers:{updateHeight:c,startPause:l,endPause:u,calculateOffset:d}}},J=w`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,M=w`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,Y=w`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,B=k("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${J} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${M} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e=>e.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${Y} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,V=w`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,X=k("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${V} 1s linear infinite;
`,Z=w`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,G=w`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,W=k("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${Z} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${G} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e=>e.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,K=k("div")`
  position: absolute;
`,Q=k("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,ee=w`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,et=k("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${ee} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,ea=({toast:e})=>{let{icon:t,type:a,iconTheme:r}=e;return void 0!==t?"string"==typeof t?i.createElement(et,null,t):t:"blank"===a?null:i.createElement(Q,null,i.createElement(X,{...r}),"loading"!==a&&i.createElement(K,null,"error"===a?i.createElement(B,{...r}):i.createElement(W,{...r})))},er=e=>`
0% {transform: translate3d(0,${-200*e}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,eo=e=>`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${-150*e}%,-1px) scale(.6); opacity:0;}
`,es=k("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,ei=k("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,en=(e,t)=>{let a=e.includes("top")?1:-1,[r,o]=P()?["0%{opacity:0;} 100%{opacity:1;}","0%{opacity:1;} 100%{opacity:0;}"]:[er(a),eo(a)];return{animation:t?`${w(r)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${w(o)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}},el=i.memo(({toast:e,position:t,style:a,children:r})=>{let o=e.height?en(e.position||t||"top-center",e.visible):{opacity:0},s=i.createElement(ea,{toast:e}),n=i.createElement(ei,{...e.ariaProps},C(e.message,e));return i.createElement(es,{className:e.className,style:{...o,...a,...e.style}},"function"==typeof r?r({icon:s,message:n}):i.createElement(i.Fragment,null,s,n))});s=i.createElement,p.p=void 0,b=s,v=void 0,x=void 0;var ec=({id:e,className:t,style:a,onHeightUpdate:r,children:o})=>{let s=i.useCallback(t=>{if(t){let a=()=>{r(e,t.getBoundingClientRect().height)};a(),new MutationObserver(a).observe(t,{subtree:!0,childList:!0,characterData:!0})}},[e,r]);return i.createElement("div",{ref:s,className:t,style:a},o)},eu=(e,t)=>{let a=e.includes("top"),r=e.includes("center")?{justifyContent:"center"}:e.includes("right")?{justifyContent:"flex-end"}:{};return{left:0,right:0,display:"flex",position:"absolute",transition:P()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${t*(a?1:-1)}px)`,...a?{top:0}:{bottom:0},...r}},ed=y`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,ep=({reverseOrder:e,position:t="top-center",toastOptions:a,gutter:r,children:o,toasterId:s,containerStyle:n,containerClassName:l})=>{let{toasts:c,handlers:u}=q(a,s);return i.createElement("div",{"data-rht-toaster":s||"",style:{position:"fixed",zIndex:9999,top:16,left:16,right:16,bottom:16,pointerEvents:"none",...n},className:l,onMouseEnter:u.startPause,onMouseLeave:u.endPause},c.map(a=>{let s=a.position||t,n=eu(s,u.calculateOffset(a,{reverseOrder:e,gutter:r,defaultPosition:t}));return i.createElement(ec,{id:a.id,key:a.id,onHeightUpdate:u.updateHeight,className:a.visible?ed:"",style:n},"custom"===a.type?C(a.message,a):o?o(a):i.createElement(el,{toast:a,position:s}))}))},ef=H}},function(e){var t=function(t){return e(e.s=t)};e.O(0,[774,179],function(){return t(1118),t(3079)}),_N_E=e.O()}]);