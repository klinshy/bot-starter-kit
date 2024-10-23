/// <reference types="@workadventure/iframe-api-typings" />

const playerThreads: { [uuid: string]: string } = {};

async function createThread(botName: string, userUuid: string): Promise<string> {
    try {
        const response = await fetch(`https://ai.newit.works/api/v1/workspace/${botName}/thread/new`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer JM2QWSW-FVYM0C0-KBR1MG5-PE3WSKK',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept': '*/*'
            },
            body: JSON.stringify({ userId: 6 })
        }).then(res => res.json());

        const threadId = response.data.thread.slug;
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
        console.error(e);
    }
}

export default {
    run: async (metadata: any) => {
        WA.onInit().then(async () => {
            console.log("COUCOU", metadata);
        });

        WA.player.proximityMeeting.onParticipantJoin().subscribe(async (user) => {
            console.log(`User ${user.name} with UUID ${user.uuid} joined the proximity meeting.`);
            const botName = await WA.player.name;

            let threadId = playerThreads[user.uuid];
            if (!threadId) {
                threadId = await createThread(botName, user.uuid);
            }

            WA.chat.onChatMessage(
                async (message, event) => {
                    if (!event.author) {
                        return;
                    }
                    await handleChatMessage(botName, threadId, message);
                },
                { scope: "bubble" }
            );
        });
    }
};
