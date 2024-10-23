const l = {
  run: async (i) => {
    const r = {};
    async function c(e, t) {
      try {
        console.log(`Creating thread for bot: ${e}, user: ${t}`);
        const n = (await fetch(`https://ai.newit.works/api/v1/workspace/${e}/thread/new`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer JM2QWSW-FVYM0C0-KBR1MG5-PE3WSKK",
            "Accept-Encoding": "gzip, deflate, br",
            Accept: "*/*"
          },
          body: JSON.stringify({ userId: 6 })
        }).then((a) => a.json())).data.thread.slug;
        return r[t] = n, console.log(`Thread created with ID: ${n} for user ${t}`), n;
      } catch (o) {
        throw console.error("Failed to create thread:", o), o;
      }
    }
    async function h(e, t, o) {
      var n;
      try {
        console.log(`Handling chat message for bot: ${e}, thread: ${t}, message: ${o}`), WA.chat.startTyping({ scope: "bubble" });
        const a = await fetch(`https://ai.newit.works/api/v1/workspace/${e}/thread/${t}/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer JM2QWSW-FVYM0C0-KBR1MG5-PE3WSKK"
          },
          body: JSON.stringify({
            message: o,
            mode: "chat",
            userId: 6
          })
        }).then((d) => d.json()), s = (n = a.choices[0]) == null ? void 0 : n.message.content;
        if (!s)
          throw new Error("Custom AI returned no response: " + JSON.stringify(a));
        console.log("Custom AI response:", s), WA.chat.sendChatMessage(s, { scope: "bubble" }), WA.chat.stopTyping({ scope: "bubble" });
      } catch (a) {
        console.error("Failed to handle chat message:", a);
      }
    }
    WA.onInit().then(async () => {
      console.log("COUCOU", i);
    }), WA.player.proximityMeeting.onParticipantJoin().subscribe(async (e) => {
      console.log(`User ${e.name} with UUID ${e.uuid} joined the proximity meeting.`);
      const t = await WA.player.name;
      let o = r[e.uuid];
      o ? console.log(`Found existing thread ${o} for user ${e.uuid}.`) : (console.log(`No existing thread for user ${e.uuid}, creating new thread.`), o = await c(t, e.uuid)), WA.chat.onChatMessage(
        async (n, a) => {
          if (!a.author) {
            console.log("Received message with no author, ignoring.");
            return;
          }
          console.log(`Received message from ${a.author.name}: ${n}`), await h(t, o, n);
        },
        { scope: "bubble" }
      );
    });
  }
};
export {
  l as default
};
