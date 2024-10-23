const l = {
  run: async (i) => {
    const r = {};
    let s;
    async function c(e, t) {
      try {
        console.log(`Creating thread for bot: ${e}, user: ${t}`);
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
        const n = (await o.json()).thread.slug;
        return r[t] = n, console.log(`Thread created with ID: ${n} for user ${t}`), n;
      } catch (o) {
        throw console.error("Failed to create thread:", o), o;
      }
    }
    async function h(e, t, o) {
      try {
        console.log(`Handling chat message for bot: ${e}, thread: ${t}, message: ${o}`), WA.chat.startTyping({ scope: "bubble" });
        const a = await fetch(`https://ai.newit.works/api/v1/workspace/kos/thread/${t}/chat`, {
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
        }).then((d) => d.json()), n = a.textResponse;
        if (!n)
          throw new Error("Custom AI returned no text response: " + JSON.stringify(a));
        console.log("Custom AI text response:", n), WA.chat.sendChatMessage(n, { scope: "bubble" }), WA.chat.stopTyping({ scope: "bubble" });
      } catch (a) {
        console.error("Failed to handle chat message:", a);
      }
    }
    WA.onInit().then(async () => {
      console.log("COUCOU", i), s = await WA.player.name, WA.player.proximityMeeting.onParticipantJoin().subscribe(async (e) => {
        console.log(`User ${e.name} with UUID ${e.uuid} joined the proximity meeting.`);
        let t = r[e.uuid];
        t ? console.log(`Found existing thread ${t} for user ${e.uuid}.`) : (console.log(`No existing thread for user ${e.uuid}, creating new thread.`), t = await c(s, e.uuid)), WA.chat.onChatMessage(
          async (o, a) => {
            if (!a.author) {
              console.log("Received message with no author, ignoring.");
              return;
            }
            console.log(`Received message from ${a.author.name}: ${o}`), await h(s, t, o);
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
