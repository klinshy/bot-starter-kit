const r = {};
async function i(n, t) {
  try {
    const e = (await fetch(`https://ai.newit.works/api/v1/workspace/${n}/thread/new`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer JM2QWSW-FVYM0C0-KBR1MG5-PE3WSKK",
        "Accept-Encoding": "gzip, deflate, br",
        Accept: "*/*"
      },
      body: JSON.stringify({ userId: 6 })
    }).then((a) => a.json())).data.thread.slug;
    return r[t] = e, console.log(`Thread created with ID: ${e} for user ${t}`), e;
  } catch (o) {
    throw console.error("Failed to create thread:", o), o;
  }
}
async function h(n, t, o) {
  var e;
  try {
    WA.chat.startTyping({ scope: "bubble" });
    const a = await fetch(`https://ai.newit.works/api/v1/workspace/${n}/thread/${t}/chat`, {
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
    }).then((c) => c.json()), s = (e = a.choices[0]) == null ? void 0 : e.message.content;
    if (!s)
      throw new Error("Custom AI returned no response: " + JSON.stringify(a));
    console.log("Custom AI response:", s), WA.chat.sendChatMessage(s, { scope: "bubble" }), WA.chat.stopTyping({ scope: "bubble" });
  } catch (a) {
    console.error(a);
  }
}
const p = {
  run: async (n) => {
    WA.onInit().then(async () => {
      console.log("COUCOU", n);
    }), WA.player.proximityMeeting.onParticipantJoin().subscribe(async (t) => {
      console.log(`User ${t.name} with UUID ${t.uuid} joined the proximity meeting.`);
      const o = await WA.player.name;
      let e = r[t.uuid];
      e || (e = await i(o, t.uuid)), WA.chat.onChatMessage(
        async (a, s) => {
          s.author && await h(o, e, a);
        },
        { scope: "bubble" }
      );
    });
  }
};
export {
  p as default
};
