const p = {
  run: async (i) => {
    await WA.onInit(), await WA.players.configureTracking({ players: !0 });
    const s = {};
    let n, r = !1;
    async function c(e) {
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
        const a = (await t.json()).thread.slug;
        return console.log(`Thread created with ID: ${a}`), a;
      } catch (t) {
        throw console.error("Failed to create thread:", t), t;
      }
    }
    async function l(e, t) {
      try {
        console.log(`Handling chat message for bot: ${n}, thread: ${e}, message: ${t}`), WA.chat.startTyping({ scope: "bubble" });
        const o = await fetch(`https://ai.newit.works/api/v1/workspace/${n}/thread/${e}/chat`, {
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
        }).then((u) => u.json()), a = o.textResponse;
        if (!a)
          throw new Error("Custom AI returned no text response: " + JSON.stringify(o));
        console.log("Custom AI text response:", a), WA.chat.sendChatMessage(a, { scope: "bubble" }), WA.chat.stopTyping({ scope: "bubble" }), console.log("Chat message handled successfully.");
      } catch (o) {
        console.error("Failed to handle chat message:", o);
      }
    }
    async function h() {
      try {
        console.log("Initializing bot with metadata:", i), n = WA.room.hashParameters.model || "kos", console.log(n + " is ready!"), console.log("Bot initialized successfully.");
      } catch (e) {
        console.error("Failed to initialize bot:", e);
      }
    }
    async function d(e) {
      try {
        console.log(`User ${e.name} with UUID ${e.uuid} joined the proximity meeting.`), console.log(`Creating new thread for user ${e.uuid}.`);
        const t = await c(n);
        s[e.uuid] = t, console.log("Participant join handled successfully.");
      } catch (t) {
        console.error("Failed to handle participant join:", t);
      }
    }
    try {
      await h(), WA.player.proximityMeeting.onJoin().subscribe(async (e) => {
        await d(e);
      }), r || (WA.chat.onChatMessage(
        async (e, t) => {
          if (!t.author) {
            console.log("Received message with no author, ignoring.");
            return;
          }
          console.log(`Received message from ${t.author.name}: ${e}`);
          const o = s[t.author.uuid];
          o ? await l(o, e) : console.log(`No thread found for user ${t.author.uuid}`);
        },
        { scope: "bubble" }
      ), r = !0), console.log("Bot initialized!");
    } catch (e) {
      console.error("Failed to run bot:", e);
    }
  }
};
export {
  p as default
};
