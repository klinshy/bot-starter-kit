const p = {
  run: async (s) => {
    WA.onInit().then(async () => {
      WA.chat.onChatMessage(
        async (n, a) => {
          var o;
          if (a.author)
            try {
              WA.chat.startTyping({
                scope: "bubble"
              });
              const e = await fetch("https://ai.newit.works/api/v1/openai/chat/completions", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: "Bearer VJD869M-CJC4KMF-JRWJFJD-Z5RNYQJ"
                },
                body: JSON.stringify({
                  messages: [{ role: "user", content: n }],
                  model: WA.player.name,
                  stream: !1,
                  temperature: 1
                })
              }).then((r) => r.json()), t = (o = e.choices[0]) == null ? void 0 : o.message.content;
              if (t == null)
                throw new Error("Custom AI returned no response: " + JSON.stringify(e));
              console.log("Custom AI response:", t), WA.chat.sendChatMessage(t, {
                scope: "bubble"
              }), WA.chat.stopTyping({
                scope: "bubble"
              });
            } catch (e) {
              console.error(e);
            }
        },
        {
          scope: "bubble"
        }
      );
    }), console.log("COUCOU", s);
  }
};
WA.player.proximityMeeting.onParticipantJoin().subscribe(async (s) => {
  console.log(`User ${s.name} with UUID ${s.uuid} joined the proximity meeting.`);
  const n = await WA.player.name;
  try {
    const o = (await fetch(`https://ai.newit.works/api/v1/workspace/${n}/thread/new`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer JM2QWSW-FVYM0C0-KBR1MG5-PE3WSKK",
        "Accept-Encoding": "gzip, deflate, br",
        Accept: "*/*"
      },
      body: JSON.stringify({ userId: 6 })
    }).then((e) => e.json())).data.thread.slug;
    console.log(`Thread created with ID: ${o}`), WA.chat.onChatMessage(
      async (e, t) => {
        var r;
        if (t.author)
          try {
            WA.chat.startTyping({ scope: "bubble" });
            const c = await fetch(`https://ai.newit.works/api/v1/workspace/${n}/thread/${o}/chat`, {
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
            }).then((h) => h.json()), i = (r = c.choices[0]) == null ? void 0 : r.message.content;
            if (i == null)
              throw new Error("Custom AI returned no response: " + JSON.stringify(c));
            console.log("Custom AI response:", i), WA.chat.sendChatMessage(i, { scope: "bubble" }), WA.chat.stopTyping({ scope: "bubble" });
          } catch (c) {
            console.error(c);
          }
      },
      { scope: "bubble" }
    );
  } catch (a) {
    console.error("Failed to create thread:", a);
  }
});
export {
  p as default
};
