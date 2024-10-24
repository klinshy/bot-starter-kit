const p = {
  run: async (i) => {
    await WA.onInit(), await WA.players.configureTracking({ players: !0 });
    const s = {};
    let n;
    async function r(e) {
      try {
        console.log(`Creating thread for bot: ${e}`);
        const t = await fetch(`https://ai.newit.works/api/v1/workspace/${e}/thread/new`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer JM2QWSW-FVYM0C0-KBR1MG5-PE3WSKK",
            "Accept-Encoding": "gzip, deflate, br",
            Accept: "*/*"
          },
          body: JSON.stringify({ userId: 6 })
        });
        if (!t.ok)
          throw new Error(`Failed to create thread: ${t.statusText}`);
        const o = (await t.json()).thread.slug;
        return console.log(`Thread created with ID: ${o}`), o;
      } catch (t) {
        throw console.error("Failed to create thread:", t), t;
      }
    }
    async function c(e, t) {
      try {
        console.log(`Handling chat message for bot: ${n}, thread: ${e}, message: ${t}`), WA.chat.startTyping({ scope: "bubble" });
        const a = await fetch(`https://ai.newit.works/api/v1/workspace/${n}/thread/${e}/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer JM2QWSW-FVYM0C0-KBR1MG5-PE3WSKK",
            "Accept-Encoding": "gzip, deflate, br",
            Accept: "*/*"
          },
          body: JSON.stringify({
            message: t,
            mode: "chat",
            userId: 6
          })
        }).then((d) => d.json()), o = a.textResponse;
        if (!o)
          throw new Error("Custom AI returned no text response: " + JSON.stringify(a));
        console.log("Custom AI text response:", o), WA.chat.sendChatMessage(o, { scope: "bubble" }), WA.chat.stopTyping({ scope: "bubble" }), console.log("Chat message handled successfully.");
      } catch (a) {
        console.error("Failed to handle chat message:", a);
      }
    }
    async function l() {
      try {
        console.log("Initializing bot with metadata:", i), n = (await WA.room.hashParameters).model || "kos", console.log(n + " is ready!"), console.log("Bot initialized successfully.");
      } catch (e) {
        console.error("Failed to initialize bot:", e);
      }
    }
    async function h(e) {
      try {
        console.log(`User ${e.name} with UUID ${e.uuid} joined the proximity meeting.`);
        let t = s[e.uuid];
        t ? console.log(`Found existing thread ${t} for user ${e.uuid}.`) : (console.log(`No existing thread for user ${e.uuid}, creating new thread.`), t = await r(n), s[e.uuid] = t), WA.chat.onChatMessage(
          async (a, o) => {
            if (!o.author) {
              console.log("Received message with no author, ignoring.");
              return;
            }
            console.log(`Received message from ${o.author.name}: ${a}`), await c(t, a);
          },
          { scope: "bubble" }
        ), console.log("Participant join handled successfully.");
      } catch (t) {
        console.error("Failed to handle participant join:", t);
      }
    }
    try {
      await l(), WA.player.proximityMeeting.onParticipantJoin().subscribe(h), console.log("Bot initialized!");
    } catch (e) {
      console.error("Failed to run bot:", e);
    }
  }
};
export {
  p as default
};
