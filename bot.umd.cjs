(function(n,o){typeof exports=="object"&&typeof module<"u"?module.exports=o():typeof define=="function"&&define.amd?define(o):(n=typeof globalThis<"u"?globalThis:n||self,n.MyBot=o())})(this,function(){"use strict";return{run:async o=>{await WA.onInit(),await WA.players.configureTracking({players:!0});let r,d=!1;async function h(e,t){var u;const f="https://api-production-db6f.up.railway.app/v1/chat-messages",m="Bearer app-C5X1afuv6miMFMkFS3dawHjt",y={inputs:{},query:e,response_mode:"streaming",conversation_id:"",user:t,files:[]};try{console.log(`Handling chat message for bot: ${r}, message: ${e}`),WA.chat.startTyping({scope:"bubble"});const a=await fetch(f,{method:"POST",headers:{Authorization:m,"Content-Type":"application/json"},body:JSON.stringify(y)});if(!a.ok)throw new Error(`Failed to handle chat message: ${a.statusText}`);const c=(u=a.body)==null?void 0:u.getReader(),b=new TextDecoder;let l="";for(;;){const{done:w,value:A}=await(c==null?void 0:c.read());if(w)break;const T=b.decode(A,{stream:!0}).split(`
`);for(const s of T)if(s.trim()){const W=s.startsWith("data: ")?s.slice(6):s;try{const i=JSON.parse(W);i.answer&&(l+=i.answer+" ")}catch(i){console.error("Error parsing chunk:",i)}}}console.log("Custom AI text response:",l.trim()),WA.chat.sendChatMessage(l.trim(),{scope:"bubble"}),WA.chat.stopTyping({scope:"bubble"}),console.log("Chat message handled successfully.")}catch(a){console.error("Failed to handle chat message:",a)}}async function p(){try{console.log("Initializing bot with metadata:",o),r=WA.room.hashParameters.model||"kos",console.log(r+" is ready!"),console.log("Bot initialized successfully.")}catch(e){console.error("Failed to initialize bot:",e)}}async function g(e){try{console.log(`User ${e.name} with UUID ${e.uuid} joined the proximity meeting.`),console.log("Participant join handled successfully.")}catch(t){console.error("Failed to handle participant join:",t)}}try{await p(),WA.player.proximityMeeting.onJoin().subscribe(async e=>{await g(e)}),d||(WA.chat.onChatMessage(async(e,t)=>{if(!t.author){console.log("Received message with no author, ignoring.");return}console.log(`Received message from ${t.author.name}: ${e}`),await h(e,t.author.uuid)},{scope:"bubble"}),d=!0),console.log("Bot initialized!")}catch(e){console.error("Failed to run bot:",e)}}}});
