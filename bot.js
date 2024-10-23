const c = {
  run: async (s) => {
    WA.onInit().then(async () => {
      WA.chat.onChatMessage(
        async (n, a) => {
          var t;
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
              }).then((r) => r.json()), o = (t = e.choices[0]) == null ? void 0 : t.message.content;
              if (o == null)
                throw new Error("Custom AI returned no response: " + JSON.stringify(e));
              console.log("Custom AI response:", o), WA.chat.sendChatMessage(o, {
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
export {
  c as default
};
