/// <reference types="@workadventure/iframe-api-typings" />

export default {
    run: async (metadata: any) => {
        WA.onInit().then(async () => {
            await WA.players.configureTracking({
                players: true
            });
            const playerThreads: { [uuid: string]: string } = {};

            async function createThread(botName: string): Promise<string> {
                try {
                    console.log(`Creating thread for bot: ${botName}`);
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
                    console.log(`Thread created with ID: ${threadId}`);
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

                    const botResponse = await fetch(`https://ai.newit.works/api/v1/workspace/${botName}/thread/${threadId}/chat`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer JM2QWSW-FVYM0C0-KBR1MG5-PE3WSKK',
                            'Accept-Encoding': 'gzip, deflate, br',
                            'Accept': '*/*'
                        },
                        body: JSON.stringify({
                            message: message,
                            mode: "chat",
                            userId: 6
                        })
                    }).then(res => res.json());

                    const textResponse = botResponse.textResponse;
                    if (!textResponse) {
                        throw new Error("Custom AI returned no text response: " + JSON.stringify(botResponse));
                    }
                    console.log("Custom AI text response:", textResponse);

                    WA.chat.sendChatMessage(textResponse, { scope: "bubble" });
                    WA.chat.stopTyping({ scope: "bubble" });
                } catch (e) {
                    console.error("Failed to handle chat message:", e);
                }
            }

            WA.onInit().then(async () => {
                console.log("COUCOU", metadata);
            });
            WA.onInit().then(async () => {
            WA.player.proximityMeeting.onParticipantJoin().subscribe(async (user) => {
                console.log(`User ${user.name} with UUID ${user.uuid} joined the proximity meeting.`);
                
                const hashParameters = await WA.room.hashParameters;
                const botName = hashParameters.model || 'kos'; // Use 'defaultBotName' if no model is provided in the hash parameters
            
                let threadId = playerThreads[user.uuid];
                if (!threadId) {
                    console.log(`No existing thread for user ${user.uuid}, creating new thread.`);
                    threadId = await createThread(botName);
                    playerThreads[user.uuid] = threadId;
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
)}};