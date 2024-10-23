const d = {
  run: async (s) => {
    const r = {};
    async function i(e) {
      try {
        console.log(`Creating thread for bot: ${e}`);
        const t = (await (await fetch(`https://ai.newit.works/api/v1/workspace/${e}/thread/new`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer JM2QWSW-FVYM0C0-KBR1MG5-PE3WSKK",
            "Accept-Encoding": "gzip, deflate, br",
            Accept: "*/*"
          },
          body: JSON.stringify({ userId: 6 })
        })).json()).thread.slug;
        return console.log(t), t;
      } catch (o) {
        throw console.error("Failed to create thread:", o), o;
      }
    }
    async function c(e, o, a) {
      try {
        console.log(`Handling chat message for bot: ${e}, thread: ${o}, message: ${a}`), WA.chat.startTyping({ scope: "bubble" });
        const t = await fetch(`https://ai.newit.works/api/v1/workspace/kos/thread/${o}/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer JM2QWSW-FVYM0C0-KBR1MG5-PE3WSKK",
            "Accept-Encoding": "gzip, deflate, br",
            Accept: "*/*"
          },
          body: JSON.stringify({
            message: "test",
            mode: "chat",
            userId: 6
          })
        }).then((h) => h.json()), n = t.textResponse;
        if (!n)
          throw new Error("Custom AI returned no text response: " + JSON.stringify(t));
        console.log("Custom AI text response:", n), WA.chat.sendChatMessage(n, { scope: "bubble" }), WA.chat.stopTyping({ scope: "bubble" });
      } catch (t) {
        console.error("Failed to handle chat message:", t);
      }
    }
    WA.onInit().then(async () => {
      console.log("COUCOU", s);
    }), WA.player.proximityMeeting.onParticipantJoin().subscribe(async (e) => {
      console.log(`User ${e.name} with UUID ${e.uuid} joined the proximity meeting.`);
      const o = await WA.player.name;
      let a = r[e.uuid];
      a ? console.log(`Found existing thread ${a} for user ${e.uuid}.`) : (console.log(`No existing thread for user ${e.uuid}, creating new thread.`), a = await i(o)), WA.chat.onChatMessage(
        async (t, n) => {
          if (!n.author) {
            console.log("Received message with no author, ignoring.");
            return;
          }
          console.log(`Received message from ${n.author.name}: ${t}`), await c(o, a, t);
        },
        { scope: "bubble" }
      );
    });
  }
};
export {
  d as default
};
