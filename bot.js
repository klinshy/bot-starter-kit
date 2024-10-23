const p = {
  run: async (c) => {
    const i = {};
    let s;
    async function h(e, o) {
      try {
        console.log(`Creating thread for bot: ${e}, user: ${o}`);
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
        return i[o] = a, console.log(`Thread created with ID: ${a} for user ${o}`), a;
      } catch (t) {
        throw console.error("Failed to create thread:", t), t;
      }
    }
    async function d(e, o, t) {
      var n;
      try {
        console.log(`Handling chat message for bot: ${e}, thread: ${o}, message: ${t}`), WA.chat.startTyping({ scope: "bubble" });
        const a = await fetch(`https://ai.newit.works/api/v1/workspace/${e}/thread/${o}/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer JM2QWSW-FVYM0C0-KBR1MG5-PE3WSKK"
          },
          body: JSON.stringify({
            message: t,
            mode: "chat",
            userId: 6
          })
        }).then((l) => l.json()), r = (n = a.choices[0]) == null ? void 0 : n.message.content;
        if (!r)
          throw new Error("Custom AI returned no response: " + JSON.stringify(a));
        console.log("Custom AI response:", r), WA.chat.sendChatMessage(r, { scope: "bubble" }), WA.chat.stopTyping({ scope: "bubble" });
      } catch (a) {
        console.error("Failed to handle chat message:", a);
      }
    }
    WA.onInit().then(async () => {
      console.log("COUCOU", c), s = await WA.player.name, WA.player.proximityMeeting.onParticipantJoin().subscribe(async (e) => {
        console.log(`User ${e.name} with UUID ${e.uuid} joined the proximity meeting.`);
        let o = i[e.uuid];
        o ? console.log(`Found existing thread ${o} for user ${e.uuid}.`) : (console.log(`No existing thread for user ${e.uuid}, creating new thread.`), o = await h(s, e.uuid)), WA.chat.onChatMessage(
          async (t, n) => {
            if (!n.author) {
              console.log("Received message with no author, ignoring.");
              return;
            }
            console.log(`Received message from ${n.author.name}: ${t}`), await d(s, o, t);
          },
          { scope: "bubble" }
        );
      });
    });
  }
};
export {
  p as default
};
