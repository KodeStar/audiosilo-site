import{r as x}from"./index.DBy5LfQW.js";var l={exports:{}},t={};/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var c;function v(){if(c)return t;c=1;var u=Symbol.for("react.transitional.element"),o=Symbol.for("react.fragment");function s(n,e,r){var i=null;if(r!==void 0&&(i=""+r),e.key!==void 0&&(i=""+e.key),"key"in e){r={};for(var a in e)a!=="key"&&(r[a]=e[a])}else r=e;return e=r.ref,{$$typeof:u,type:n,key:i,ref:e!==void 0?e:null,props:r}}return t.Fragment=o,t.jsx=s,t.jsxs=s,t}var p;function R(){return p||(p=1,l.exports=v()),l.exports}var d=R();const f="v1.9.0";function h({className:u=""}){const[o,s]=x.useState(f);return x.useEffect(()=>{let n=!1;return fetch("https://api.github.com/repos/KodeStar/audiosilo-server/releases/latest").then(e=>e.ok?e.json():null).then(e=>{!n&&e&&e.tag_name&&s(e.tag_name)}).catch(()=>{}),()=>{n=!0}},[]),d.jsx("span",{className:u,children:o})}export{h as default};
