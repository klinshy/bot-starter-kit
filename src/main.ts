/// <reference types="@workadventure/iframe-api-typings" />

const playerThreads: { [uuid: string]: string } = {};

export default {
    run: async (metadata: any) => {
        WA.onInit().then(async () => {
            WA.chat.onChatMessage(
                async (message, event) => {
                    if (!event.author) {
                        return;
                    }

                    try {
                        WA.chat.startTyping({ scope: "bubble" });
                        const chatCompletion = await fetch('https://ai.newit.works/api/v1/openai/chat/completions', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer VJD869M-CJC4KMF-JRWJFJD-Z5RNYQJ`
                            },
                            body: JSON.stringify({
                                messages: [{ role: 'user', content: message }],
                                model: WA.player.name,
                                stream: false,
                                temperature: 1
                            })
                        }).then(response => response.json());

                        const response = chatCompletion.choices[0]?.message.content;
                        if (response === null || response === undefined) {
                            throw new Error("Custom AI returned no response: " + JSON.stringify(chatCompletion));
                        }
                        console.log("Custom AI response:", response);

                        WA.chat.sendChatMessage(response, { scope: "bubble" });
                        WA.chat.stopTyping({ scope: "bubble" });
                    } catch (e) {
                        console.error(e);
                    }
                },
                { scope: "bubble" }
            );

            console.log("COUCOU", metadata);
        });

        WA.player.proximityMeeting.onParticipantJoin().subscribe(async (user) => {
            console.log(`User ${user.name} with UUID ${user.uuid} joined the proximity meeting.`);
            const botName = await WA.player.name;

            if (!playerThreads[user.uuid]) {
                try {
                    const threadResponse = await fetch(`https://ai.newit.works/api/v1/workspace/${botName}/thread/new`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer JM2QWSW-FVYM0C0-KBR1MG5-PE3WSKK',
                            'Accept-Encoding': 'gzip, deflate, br',
                            'Accept': '*/*'
                        },
                        body: JSON.stringify({ userId: 6 })
                    }).then(response => response.json());

                    const threadId = threadResponse.data.thread.slug;
                    playerThreads[user.uuid] = threadId;
                    console.log(`Thread created with ID: ${threadId} for user ${user.uuid}`);
                } catch (e) {
                    console.error("Failed to create thread:", e);
                }
            }

            const threadId = playerThreads[user.uuid];
            WA.chat.onChatMessage(
                async (message, event) => {
                    if (!event.author) {
                        return;
                    }

                    try {
                        WA.chat.startTyping({ scope: "bubble" });

                        const chatResponse = await fetch(`https://ai.newit.works/api/v1/workspace/${botName}/thread/${threadId}/chat`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer JM2QWSW-FVYM0C0-KBR1MG5-PE3WSKK'
                            },
                            body: JSON.stringify({
                                message: message,
                                mode: "chat",
                                userId: 6
                            })
                        }).then(response => response.json());

                        const response = chatResponse.choices[0]?.message.content;
                        if (response === null || response === undefined) {
                            throw new Error("Custom AI returned no response: " + JSON.stringify(chatResponse));
                        }
                        console.log("Custom AI response:", response);

                        WA.chat.sendChatMessage(response, { scope: "bubble" });
                        WA.chat.stopTyping({ scope: "bubble" });
                    } catch (e) {
                        console.error(e);
                    }
                },
                { scope: "bubble" }
            );
        });
    }
};
