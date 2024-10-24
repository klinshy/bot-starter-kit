const d = {
  run: async (r) => {
    WA.onInit().then(async () => {
      const s = {};
      async function i(t) {
        try {
          console.log(`Creating thread for bot: ${t}`);
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
          return console.log(`Thread created with ID: ${o}`), o;
        } catch (e) {
          throw console.error("Failed to create thread:", e), e;
        }
      }
      async function c(t, e, a) {
        try {
          console.log(`Handling chat message for bot: ${t}, thread: ${e}, message: ${a}`), WA.chat.startTyping({ scope: "bubble" });
          const o = await fetch(`https://ai.newit.works/api/v1/workspace/kos/thread/${e}/chat`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer JM2QWSW-FVYM0C0-KBR1MG5-PE3WSKK",
              "Accept-Encoding": "gzip, deflate, br",
              Accept: "*/*"
            },
            body: JSON.stringify({
              message: a,
              mode: "chat",
              userId: 6
            })
          }).then((h) => h.json()), n = o.textResponse;
          if (!n)
            throw new Error("Custom AI returned no text response: " + JSON.stringify(o));
          console.log("Custom AI text response:", n), WA.chat.sendChatMessage(n, { scope: "bubble" }), WA.chat.stopTyping({ scope: "bubble" });
        } catch (o) {
          console.error("Failed to handle chat message:", o);
        }
      }
      WA.onInit().then(async () => {
        console.log("COUCOU", r);
      }), WA.player.proximityMeeting.onParticipantJoin().subscribe(async (t) => {
        console.log(`User ${t.name} with UUID ${t.uuid} joined the proximity meeting.`);
        const e = await WA.player.name;
        let a = s[t.uuid];
        a ? console.log(`Found existing thread ${a} for user ${t.uuid}.`) : (console.log(`No existing thread for user ${t.uuid}, creating new thread.`), a = await i(e), s[t.uuid] = a), WA.chat.onChatMessage(
          async (o, n) => {
            if (!n.author) {
              console.log("Received message with no author, ignoring.");
              return;
            }
            console.log(`Received message from ${n.author.name}: ${o}`), await c(e, a, o);
          },
          { scope: "bubble" }
        );
      });
    });
  }
};
export {
  d as default
};
