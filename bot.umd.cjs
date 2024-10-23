(function(r,s){typeof exports=="object"&&typeof module<"u"?module.exports=s():typeof define=="function"&&define.amd?define(s):(r=typeof globalThis<"u"?globalThis:r||self,r.MyBot=s())})(this,function(){"use strict";return{run:async s=>{const c={};async function h(t,n){try{console.log(`Creating thread for bot: ${t}, user: ${n}`);const e=await fetch(`https://ai.newit.works/api/v1/workspace/${t}/thread/new`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer JM2QWSW-FVYM0C0-KBR1MG5-PE3WSKK","Accept-Encoding":"gzip, deflate, br",Accept:"*/*"},body:JSON.stringify({userId:6})});if(!e.ok)throw new Error(`Failed to create thread: ${e.statusText}`);const o=(await e.json()).thread.slug;return c[n]=o,console.log(`Thread created with ID: ${o} for user ${n}`),o}catch(e){throw console.error("Failed to create thread:",e),e}}async function d(t,n,e){var a;try{console.log(`Handling chat message for bot: ${t}, thread: ${n}, message: ${e}`),WA.chat.startTyping({scope:"bubble"});const o=await fetch(`https://ai.newit.works/api/v1/workspace/${t}/thread/${n}/chat`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer JM2QWSW-FVYM0C0-KBR1MG5-PE3WSKK"},body:JSON.stringify({message:e,mode:"chat",userId:6})}).then(l=>l.json()),i=(a=o.choices[0])==null?void 0:a.message.content;if(!i)throw new Error("Custom AI returned no response: "+JSON.stringify(o));console.log("Custom AI response:",i),WA.chat.sendChatMessage(i,{scope:"bubble"}),WA.chat.stopTyping({scope:"bubble"})}catch(o){console.error("Failed to handle chat message:",o)}}WA.onInit().then(async()=>{console.log("COUCOU",s),WA.player.proximityMeeting.onParticipantJoin().subscribe(async t=>{console.log(`User ${t.name} with UUID ${t.uuid} joined the proximity meeting.`);const n=await WA.player.name;let e=c[t.uuid];e?console.log(`Found existing thread ${e} for user ${t.uuid}.`):(console.log(`No existing thread for user ${t.uuid}, creating new thread.`),e=await h(n,t.uuid)),WA.chat.onChatMessage(async(a,o)=>{if(!o.author){console.log("Received message with no author, ignoring.");return}console.log(`Received message from ${o.author.name}: ${a}`),await d(n,e,a)},{scope:"bubble"})})})}}});