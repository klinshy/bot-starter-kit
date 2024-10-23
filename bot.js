const l = {
  run: async (i) => {
    const r = {};
    async function c(t, a) {
      try {
        console.log(`Creating thread for bot: ${t}, user: ${a}`);
        const e = await fetch(`https://ai.newit.works/api/v1/workspace/${t}/thread/new`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer JM2QWSW-FVYM0C0-KBR1MG5-PE3WSKK",
            "Accept-Encoding": "gzip, deflate, br",
            Accept: "*/*"
          },
          body: JSON.stringify({ userId: 6 })
        });
        if (!e.ok)
          throw new Error(`Failed to create thread: ${e.statusText}`);
        const o = (await e.json()).thread.slug;
        return r[a] = o, console.log(`Thread created with ID: ${o} for user ${a}`), o;
      } catch (e) {
        throw console.error("Failed to create thread:", e), e;
      }
    }
    async function h(t, a, e) {
      var n;
      try {
        console.log(`Handling chat message for bot: ${t}, thread: ${a}, message: ${e}`), WA.chat.startTyping({ scope: "bubble" });
        const o = await fetch(`https://ai.newit.works/api/v1/workspace/${t}/thread/${a}/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer JM2QWSW-FVYM0C0-KBR1MG5-PE3WSKK"
          },
          body: JSON.stringify({
            message: e,
            mode: "chat",
            userId: 6
          })
        }).then((d) => d.json()), s = (n = o.choices[0]) == null ? void 0 : n.message.content;
        if (!s)
          throw new Error("Custom AI returned no response: " + JSON.stringify(o));
        console.log("Custom AI response:", s), WA.chat.sendChatMessage(s, { scope: "bubble" }), WA.chat.stopTyping({ scope: "bubble" });
      } catch (o) {
        console.error("Failed to handle chat message:", o);
      }
    }
    WA.onInit().then(async () => {
      console.log("COUCOU", i), WA.player.proximityMeeting.onParticipantJoin().subscribe(async (t) => {
        console.log(`User ${t.name} with UUID ${t.uuid} joined the proximity meeting.`);
        const a = await WA.player.name;
        let e = r[t.uuid];
        e ? console.log(`Found existing thread ${e} for user ${t.uuid}.`) : (console.log(`No existing thread for user ${t.uuid}, creating new thread.`), e = await c(a, t.uuid)), WA.chat.onChatMessage(
          async (n, o) => {
            if (!o.author) {
              console.log("Received message with no author, ignoring.");
              return;
            }
            console.log(`Received message from ${o.author.name}: ${n}`), await h(a, e, n);
          },
          { scope: "bubble" }
        );
      });
    });
  }
};
export {
  l as default
};
