const u = {
  run: async (c) => {
    await WA.onInit(), await WA.players.configureTracking({ players: !0 });
    const r = {};
    let n;
    async function l(e) {
      try {
        console.log(`Creating thread for bot: ${e}`);
        const o = await fetch(`https://ai.newit.works/api/v1/workspace/${e}/thread/new`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer JM2QWSW-FVYM0C0-KBR1MG5-PE3WSKK",
            "Accept-Encoding": "gzip, deflate, br",
            Accept: "*/*"
          },
          body: JSON.stringify({ userId: 6 })
        });
        if (!o.ok)
          throw new Error(`Failed to create thread: ${o.statusText}`);
        const t = (await o.json()).thread.slug;
        return console.log(`Thread created with ID: ${t}`), t;
      } catch (o) {
        throw console.error("Failed to create thread:", o), o;
      }
    }
    async function i(e, o) {
      try {
        console.log(`Handling chat message for bot: ${n}, thread: ${e}, message: ${o}`), WA.chat.startTyping({ scope: "bubble" });
        const a = await fetch(`https://ai.newit.works/api/v1/workspace/${n}/thread/${e}/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer JM2QWSW-FVYM0C0-KBR1MG5-PE3WSKK",
            "Accept-Encoding": "gzip, deflate, br",
            Accept: "*/*"
          },
          body: JSON.stringify({
            message: o,
            mode: "chat",
            userId: 6
          })
        }).then((s) => s.json()), t = a.textResponse;
        if (!t)
          throw new Error("Custom AI returned no text response: " + JSON.stringify(a));
        console.log("Custom AI text response:", t), WA.chat.sendChatMessage(t, { scope: "bubble" }), WA.chat.stopTyping({ scope: "bubble" }), console.log("Chat message handled successfully.");
      } catch (a) {
        console.error("Failed to handle chat message:", a);
      }
    }
    async function h() {
      try {
        console.log("Initializing bot with metadata:", c), n = WA.room.hashParameters.model || "kos", console.log(n + " is ready!"), console.log("Bot initialized successfully.");
      } catch (e) {
        console.error("Failed to initialize bot:", e);
      }
    }
    async function d(e) {
      try {
        console.log(`User ${e.name} with UUID ${e.uuid} joined the proximity meeting.`);
        let o = r[e.uuid];
        o ? console.log(`Found existing thread ${o} for user ${e.uuid}.`) : (console.log(`No existing thread for user ${e.uuid}, creating new thread.`), o = await l(n), r[e.uuid] = o), WA.chat.onChatMessage(
          async (a, t) => {
            if (!t.author) {
              console.log("Received message with no author, ignoring.");
              return;
            }
            console.log(`Received message from ${t.author.name}: ${a}`), await i(o, a);
          },
          { scope: "bubble" }
        ), console.log("Participant join handled successfully.");
      } catch (o) {
        console.error("Failed to handle participant join:", o);
      }
    }
    try {
      await h();
      let e = !1;
      WA.player.proximityMeeting.onJoin().subscribe(async (o) => {
        await d(o), e || (WA.chat.onChatMessage(
          async (a, t) => {
            if (!t.author) {
              console.log("Received message with no author, ignoring.");
              return;
            }
            console.log(`Received message from ${t.author.name}: ${a}`);
            const s = r[t.author.uuid];
            s ? await i(s, a) : console.log(`No thread found for user ${t.author.uuid}`);
          },
          { scope: "bubble" }
        ), e = !0);
      }), console.log("Bot initialized!");
    } catch (e) {
      console.error("Failed to run bot:", e);
    }
  }
};
export {
  u as default
};
