// ==UserScript==
// @name         AutoTrimps-Xanza
// @version      1.0-Xanza
// @namespace    https://ixanza.github.io/AutoTrimps
// @updateURL    https://ixanza.github.io/AutoTrimps/.user.js
// @description  Automate all the trimps!
// @author       zininzinin, spindrjr, Ishkaru, genBTC, Zeker0, OrkunKocyigit
// @include      *trimps.github.io*
// @include      *kongregate.com/games/GreenSatellite/trimps
// @connect      *ixanza.github.io/AutoTrimps*
// @connect      *trimps.github.io*
// @connect      self
// @grant        GM_xmlhttpRequest
// ==/UserScript==

var script = document.createElement('script');
script.id = 'AutoTrimps-Xanza';
//This can be edited to point to your own Github Repository URL.
script.src = 'https://ixanza.github.io/AutoTrimps/AutoTrimps2.js';
//script.setAttribute('crossorigin',"use-credentials");
script.setAttribute('crossorigin',"anonymous");
document.head.appendChild(script);
