/// <reference types="@workadventure/iframe-api-typings" />

export default {
    run: async (metadata: any) => {
        const playerThreads: { [uuid: string]: string } = {};

        async function createThread(botName: string, userUuid: string): Promise<string> {
            try {
                console.log(`Creating thread for bot: ${botName}, user: ${userUuid}`);
                const response = await fetch(`https://ai.newit.works/api/v1/workspace/${botName}/thread/new`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer JM2QWSW-FVYM0C0-KBR1MG5-PE3WSKK',
                        'Accept-Encoding': 'gzip, deflate, br',
                        'Accept': '*/*'
                    },
                    body: JSON.stringify({ userId: 6 })
                });

                if (!response.ok) {
                    throw new Error(`Failed to create thread: ${response.statusText}`);
                }

                const responseData = await response.json();
                const threadId = responseData.thread.slug;
                playerThreads[userUuid] = threadId;
                console.log(`Thread created with ID: ${threadId} for user ${userUuid}`);
                return threadId;
            } catch (e) {
                console.error("Failed to create thread:", e);
                throw e;
            }
        }

        async function handleChatMessage(botName: string, threadId: string, message: string) {
            try {
                console.log(`Handling chat message for bot: ${botName}, thread: ${threadId}, message: ${message}`);
                WA.chat.startTyping({ scope: "bubble" });

                const response = await fetch(`https://ai.newit.works/api/v1/workspace/${botName}/thread/${threadId}/chat`, {
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
                }).then(res => res.json());

                const chatResponse = response.choices[0]?.message.content;
                if (!chatResponse) {
                    throw new Error("Custom AI returned no response: " + JSON.stringify(response));
                }
                console.log("Custom AI response:", chatResponse);

                WA.chat.sendChatMessage(chatResponse, { scope: "bubble" });
                WA.chat.stopTyping({ scope: "bubble" });
            } catch (e) {
                console.error("Failed to handle chat message:", e);
            }
        }

        WA.onInit().then(async () => {
            console.log("COUCOU", metadata);

            WA.player.proximityMeeting.onParticipantJoin().subscribe(async (user) => {
                console.log(`User ${user.name} with UUID ${user.uuid} joined the proximity meeting.`);
                const botName = await WA.player.name;

                let threadId = playerThreads[user.uuid];
                if (!threadId) {
                    console.log(`No existing thread for user ${user.uuid}, creating new thread.`);
                    threadId = await createThread(botName, user.uuid);
                } else {
                    console.log(`Found existing thread ${threadId} for user ${user.uuid}.`);
                }

                WA.chat.onChatMessage(
                    async (message, event) => {
                        if (!event.author) {
                            console.log("Received message with no author, ignoring.");
                            return;
                        }
                        console.log(`Received message from ${event.author.name}: ${message}`);
                        await handleChatMessage(botName, threadId, message);
                    },
                    { scope: "bubble" }
                );
            });
        });
    }
};
