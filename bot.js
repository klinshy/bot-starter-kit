const u = {
  run: async (r) => {
    await WA.onInit(), await WA.players.configureTracking({ players: !0 });
    const s = {};
    let n;
    async function i(e) {
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
        const a = (await o.json()).thread.slug;
        return console.log(`Thread created with ID: ${a}`), a;
      } catch (o) {
        throw console.error("Failed to create thread:", o), o;
      }
    }
    async function c(e, o) {
      try {
        console.log(`Handling chat message for bot: ${n}, thread: ${e}, message: ${o}`), WA.chat.startTyping({ scope: "bubble" });
        const t = await fetch(`https://ai.newit.works/api/v1/workspace/${n}/thread/${e}/chat`, {
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
        }).then((d) => d.json()), a = t.textResponse;
        if (!a)
          throw new Error("Custom AI returned no text response: " + JSON.stringify(t));
        console.log("Custom AI text response:", a), WA.chat.sendChatMessage(a, { scope: "bubble" }), WA.chat.stopTyping({ scope: "bubble" }), console.log("Chat message handled successfully.");
      } catch (t) {
        console.error("Failed to handle chat message:", t);
      }
    }
    async function l() {
      try {
        console.log("Initializing bot with metadata:", r), n = WA.room.hashParameters.model || "kos", console.log(n + " is ready!"), console.log("Bot initialized successfully.");
      } catch (e) {
        console.error("Failed to initialize bot:", e);
      }
    }
    async function h(e) {
      try {
        console.log(`User ${e.name} with UUID ${e.uuid} joined the proximity meeting.`), console.log(`Creating new thread for user ${e.uuid}.`);
        const o = await i(n);
        s[e.uuid] = o, console.log("Participant join handled successfully.");
      } catch (o) {
        console.error("Failed to handle participant join:", o);
      }
    }
    try {
      await l(), WA.player.proximityMeeting.onJoin().subscribe(async (e) => {
        await h(e);
      }), WA.chat.onChatMessage(
        async (e, o) => {
          if (!o.author) {
            console.log("Received message with no author, ignoring.");
            return;
          }
          console.log(`Received message from ${o.author.name}: ${e}`);
          const t = s[o.author.uuid];
          t ? await c(t, e) : console.log(`No thread found for user ${o.author.uuid}`);
        },
        { scope: "bubble" }
      ), console.log("Bot initialized!");
    } catch (e) {
      console.error("Failed to run bot:", e);
    }
  }
};
export {
  u as default
};
