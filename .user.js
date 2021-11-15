// ==UserScript==
// @name         AutoTrimps-Orkun
// @version      1.0-Orkun
// @namespace    https://orkunkocyigit.github.io/AutoTrimps
// @updateURL    https://orkunkocyigit.github.io/AutoTrimps/.user.js
// @description  Automate all the trimps!
// @author       zininzinin, spindrjr, Ishkaru, genBTC, Zeker0, OrkunKocyigit
// @include      *trimps.github.io*
// @include      *kongregate.com/games/GreenSatellite/trimps
// @connect      *orkunkocyigit.github.io/AutoTrimps*
// @connect      *trimps.github.io*
// @connect      self
// @grant        GM_xmlhttpRequest
// ==/UserScript==

var script = document.createElement('script');
script.id = 'AutoTrimps-Orkun';
//This can be edited to point to your own Github Repository URL.
script.src = 'https://orkunkocyigit.github.io/AutoTrimps/AutoTrimps2.js';
//script.setAttribute('crossorigin',"use-credentials");
script.setAttribute('crossorigin',"anonymous");
document.head.appendChild(script);
