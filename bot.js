const d = {
  run: async (i) => {
    WA.onInit().then(async () => {
      await WA.players.configureTracking({
        players: !0
      });
      const r = {};
      async function c(t) {
        try {
          console.log(`Creating thread for bot: ${t}`);
          const o = await fetch(`https://ai.newit.works/api/v1/workspace/${t}/thread/new`, {
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
          const e = (await o.json()).thread.slug;
          return console.log(`Thread created with ID: ${e}`), e;
        } catch (o) {
          throw console.error("Failed to create thread:", o), o;
        }
      }
      async function h(t, o, a) {
        try {
          console.log(`Handling chat message for bot: ${t}, thread: ${o}, message: ${a}`), WA.chat.startTyping({ scope: "bubble" });
          const e = await fetch(`https://ai.newit.works/api/v1/workspace/kos/thread/${o}/chat`, {
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
          }).then((s) => s.json()), n = e.textResponse;
          if (!n)
            throw new Error("Custom AI returned no text response: " + JSON.stringify(e));
          console.log("Custom AI text response:", n), WA.chat.sendChatMessage(n, { scope: "bubble" }), WA.chat.stopTyping({ scope: "bubble" });
        } catch (e) {
          console.error("Failed to handle chat message:", e);
        }
      }
      WA.onInit().then(async () => {
        console.log("COUCOU", i);
      }), WA.player.proximityMeeting.onParticipantJoin().subscribe(async (t) => {
        console.log(`User ${t.name} with UUID ${t.uuid} joined the proximity meeting.`);
        const a = (await WA.room.hashParameters).botName || "defaultBotName";
        let e = r[t.uuid];
        e ? console.log(`Found existing thread ${e} for user ${t.uuid}.`) : (console.log(`No existing thread for user ${t.uuid}, creating new thread.`), e = await c(a), r[t.uuid] = e), WA.chat.onChatMessage(
          async (n, s) => {
            if (!s.author) {
              console.log("Received message with no author, ignoring.");
              return;
            }
            console.log(`Received message from ${s.author.name}: ${n}`), await h(a, e, n);
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
