const C = {
  run: async (h) => {
    await WA.onInit(), await WA.players.configureTracking({ players: !0 });
    let n, c = !1;
    async function d(e, t) {
      var l;
      const p = "https://api-production-db6f.up.railway.app/v1/chat-messages", m = "Bearer app-C5X1afuv6miMFMkFS3dawHjt", y = {
        inputs: {},
        query: e,
        response_mode: "streaming",
        conversation_id: "",
        user: t,
        files: []
      };
      try {
        console.log(`Handling chat message for bot: ${n}, message: ${e}`), WA.chat.startTyping({ scope: "bubble" });
        const o = await fetch(p, {
          method: "POST",
          headers: {
            Authorization: m,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(y)
        });
        if (!o.ok)
          throw new Error(`Failed to handle chat message: ${o.statusText}`);
        const i = (l = o.body) == null ? void 0 : l.getReader(), f = new TextDecoder();
        let r = "";
        for (; ; ) {
          const { done: b, value: w } = await (i == null ? void 0 : i.read());
          if (b) break;
          const A = f.decode(w, { stream: !0 }).split(`
`);
          for (const a of A)
            if (a.trim()) {
              const W = a.startsWith("data: ") ? a.slice(6) : a;
              try {
                const s = JSON.parse(W);
                s.answer && (r += s.answer + " ");
              } catch (s) {
                console.error("Error parsing chunk:", s);
              }
            }
        }
        console.log("Custom AI text response:", r.trim()), WA.chat.sendChatMessage(r.trim(), { scope: "bubble" }), WA.chat.stopTyping({ scope: "bubble" }), console.log("Chat message handled successfully.");
      } catch (o) {
        console.error("Failed to handle chat message:", o);
      }
    }
    async function u() {
      try {
        console.log("Initializing bot with metadata:", h), n = WA.room.hashParameters.model || "kos", console.log(n + " is ready!"), console.log("Bot initialized successfully.");
      } catch (e) {
        console.error("Failed to initialize bot:", e);
      }
    }
    async function g(e) {
      try {
        console.log(`User ${e.name} with UUID ${e.uuid} joined the proximity meeting.`), console.log("Participant join handled successfully.");
      } catch (t) {
        console.error("Failed to handle participant join:", t);
      }
    }
    try {
      await u(), WA.player.proximityMeeting.onJoin().subscribe(async (e) => {
        await g(e);
      }), c || (WA.chat.onChatMessage(
        async (e, t) => {
          if (!t.author) {
            console.log("Received message with no author, ignoring.");
            return;
          }
          console.log(`Received message from ${t.author.name}: ${e}`), await d(e, t.author.uuid);
        },
        { scope: "bubble" }
      ), c = !0), console.log("Bot initialized!");
    } catch (e) {
      console.error("Failed to run bot:", e);
    }
  }
};
export {
  C as default
};
