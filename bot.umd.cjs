(function(r,s){typeof exports=="object"&&typeof module<"u"?module.exports=s():typeof define=="function"&&define.amd?define(s):(r=typeof globalThis<"u"?globalThis:r||self,r.MyBot=s())})(this,function(){"use strict";return{run:async s=>{WA.onInit().then(async()=>{await WA.players.configureTracking({players:!0});const c={};async function h(t){try{console.log(`Creating thread for bot: ${t}`);const o=await fetch(`https://ai.newit.works/api/v1/workspace/${t}/thread/new`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer JM2QWSW-FVYM0C0-KBR1MG5-PE3WSKK","Accept-Encoding":"gzip, deflate, br",Accept:"*/*"},body:JSON.stringify({userId:6})});if(!o.ok)throw new Error(`Failed to create thread: ${o.statusText}`);const e=(await o.json()).thread.slug;return console.log(`Thread created with ID: ${e}`),e}catch(o){throw console.error("Failed to create thread:",o),o}}async function d(t,o,n){try{console.log(`Handling chat message for bot: ${t}, thread: ${o}, message: ${n}`),WA.chat.startTyping({scope:"bubble"});const e=await fetch(`https://ai.newit.works/api/v1/workspace/${t}/thread/${o}/chat`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer JM2QWSW-FVYM0C0-KBR1MG5-PE3WSKK","Accept-Encoding":"gzip, deflate, br",Accept:"*/*"},body:JSON.stringify({message:n,mode:"chat",userId:6})}).then(i=>i.json()),a=e.textResponse;if(!a)throw new Error("Custom AI returned no text response: "+JSON.stringify(e));console.log("Custom AI text response:",a),WA.chat.sendChatMessage(a,{scope:"bubble"}),WA.chat.stopTyping({scope:"bubble"})}catch(e){console.error("Failed to handle chat message:",e)}}WA.onInit().then(async()=>{console.log("COUCOU",s)}),WA.player.proximityMeeting.onParticipantJoin().subscribe(async t=>{console.log(`User ${t.name} with UUID ${t.uuid} joined the proximity meeting.`);const n=(await WA.room.hashParameters).model||"kos";let e=c[t.uuid];e?console.log(`Found existing thread ${e} for user ${t.uuid}.`):(console.log(`No existing thread for user ${t.uuid}, creating new thread.`),e=await h(n),c[t.uuid]=e),WA.chat.onChatMessage(async(a,i)=>{if(!i.author){console.log("Received message with no author, ignoring.");return}console.log(`Received message from ${i.author.name}: ${a}`),await d(n,e,a)},{scope:"bubble"})})})}}});
