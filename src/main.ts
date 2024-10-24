/// <reference types="@workadventure/iframe-api-typings" />

export default {
    run: async (metadata: any) => {
        await WA.onInit();

        await WA.players.configureTracking({ players: true });

        const playerThreads: { [uuid: string]: string } = {};
        let botName: string;
        let isChatHandlerRegistered = false;

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

        async function handleChatMessage(threadId: string, message: string) {
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
                console.log("Chat message handled successfully.");
            } catch (e) {
                console.error("Failed to handle chat message:", e);
            }
        }

        async function initializeBot() {
            try {
                console.log("Initializing bot with metadata:", metadata);
                const hashParameters = WA.room.hashParameters;
                botName = hashParameters.model || 'kos'; // Use 'defaultBotName' if no model is provided in the hash parameters
                console.log(botName + " is ready!");
                console.log("Bot initialized successfully.");
            } catch (e) {
                console.error("Failed to initialize bot:", e);
            }
        }

        async function onParticipantJoin(user: any) { 
            try {
                console.log(`User ${user.name} with UUID ${user.uuid} joined the proximity meeting.`);
                
                // Always create a new thread when a user joins
                console.log(`Creating new thread for user ${user.uuid}.`);
                const threadId = await createThread(botName);
                playerThreads[user.uuid] = threadId;

                console.log("Participant join handled successfully.");
            } catch (e) {
                console.error("Failed to handle participant join:", e);
            }
        }

        try {
            await initializeBot();

            WA.player.proximityMeeting.onJoin().subscribe(async (user) => {
                await onParticipantJoin(user);
            });

            if (!isChatHandlerRegistered) {
                WA.chat.onChatMessage(
                    async (message, event) => {
                        if (!event.author) {
                            console.log("Received message with no author, ignoring.");
                            return;
                        }
                        console.log(`Received message from ${event.author.name}: ${message}`);
                        const threadId = playerThreads[event.author.uuid];
                        if (threadId) {
                            await handleChatMessage(threadId, message);
                        } else {
                            console.log(`No thread found for user ${event.author.uuid}`);
                        }
                    },
                    { scope: "bubble" }
                );
                isChatHandlerRegistered = true;
            }

            console.log("Bot initialized!");
        } catch (e) {
            console.error("Failed to run bot:", e);
        }
    }
};