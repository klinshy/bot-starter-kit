const i = {}, d = {
  run: async (h) => {
    WA.onInit().then(async () => {
      WA.chat.onChatMessage(
        async (o, n) => {
          var a;
          if (n.author)
            try {
              WA.chat.startTyping({ scope: "bubble" });
              const e = await fetch("https://ai.newit.works/api/v1/openai/chat/completions", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: "Bearer VJD869M-CJC4KMF-JRWJFJD-Z5RNYQJ"
                },
                body: JSON.stringify({
                  messages: [{ role: "user", content: o }],
                  model: WA.player.name,
                  stream: !1,
                  temperature: 1
                })
              }).then((s) => s.json()), t = (a = e.choices[0]) == null ? void 0 : a.message.content;
              if (t == null)
                throw new Error("Custom AI returned no response: " + JSON.stringify(e));
              console.log("Custom AI response:", t), WA.chat.sendChatMessage(t, { scope: "bubble" }), WA.chat.stopTyping({ scope: "bubble" });
            } catch (e) {
              console.error(e);
            }
        },
        { scope: "bubble" }
      ), console.log("COUCOU", h);
    }), WA.player.proximityMeeting.onParticipantJoin().subscribe(async (o) => {
      console.log(`User ${o.name} with UUID ${o.uuid} joined the proximity meeting.`);
      const n = await WA.player.name;
      if (!i[o.uuid])
        try {
          const t = (await fetch(`https://ai.newit.works/api/v1/workspace/${n}/thread/new`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer JM2QWSW-FVYM0C0-KBR1MG5-PE3WSKK",
              "Accept-Encoding": "gzip, deflate, br",
              Accept: "*/*"
            },
            body: JSON.stringify({ userId: 6 })
          }).then((s) => s.json())).data.thread.slug;
          i[o.uuid] = t, console.log(`Thread created with ID: ${t} for user ${o.uuid}`);
        } catch (e) {
          console.error("Failed to create thread:", e);
        }
      const a = i[o.uuid];
      WA.chat.onChatMessage(
        async (e, t) => {
          var s;
          if (t.author)
            try {
              WA.chat.startTyping({ scope: "bubble" });
              const r = await fetch(`https://ai.newit.works/api/v1/workspace/${n}/thread/${a}/chat`, {
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
              }).then((p) => p.json()), c = (s = r.choices[0]) == null ? void 0 : s.message.content;
              if (c == null)
                throw new Error("Custom AI returned no response: " + JSON.stringify(r));
              console.log("Custom AI response:", c), WA.chat.sendChatMessage(c, { scope: "bubble" }), WA.chat.stopTyping({ scope: "bubble" });
            } catch (r) {
              console.error(r);
            }
        },
        { scope: "bubble" }
      );
    });
  }
};
export {
  d as default
};
