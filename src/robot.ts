import { throttle } from "throttle-debounce";
import { getMovePrompt } from "./movePrompt";
import { RemotePlayer } from "@workadventure/iframe-api-typings/front/Api/Iframe/Players/RemotePlayer";
import { getChatPrompt, userJoinedChat } from "./chatPrompt";
import {botName} from "./main";

// TODO: import this file ONLY in robot mode
//const model = await botName() as string;
const throttledMovePrompt = throttle(30000, async () => {
    // TODO: do this only if in "waiting mode"
    const movePrompt = await getMovePrompt();

    console.log("Sending prompt: ", movePrompt);

    const chatCompletion = await fetch('https://ai.newit.works/api/v1/openai/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer VJD869M-CJC4KMF-JRWJFJD-Z5RNYQJ`
        },
        body: JSON.stringify({
            messages: [{ role: 'user', content: movePrompt }],
            model: botName,
            stream: false,
            temperature: 1
        })
    }).then(response => response.json());

    const response = chatCompletion.choices[0]?.message.content;
    if (response === null) {
        console.error("Custom AI returned no response: ", chatCompletion);
        return;
    }
    console.log("Custom AI response:", response);

    if (response.startsWith("Go to ")) {
        const name = response.substring(6);
        console.log("Going to ", name);
        const players = WA.players.list();
        for (const player of players) {
            if (player.name === name) {
                await WA.player.moveTo(player.position.x, player.position.y);
                break;
            }
        }
    }
}, {
    noTrailing: false,
    noLeading: false,
});

class Robot {
    private mode: "waiting" | "chatting" = "waiting";
    private chatHistory: Array<{ role: "system" | "assistant", content: string } | { role: "user", player: RemotePlayer, content: string }> = [];

    init() {
        console.log("Robot is starting...");

        WA.players.onVariableChange('currentPlace').subscribe(async () => {
            if (this.mode === "waiting") {
                throttledMovePrompt();
            }
        });

        WA.player.proximityMeeting.onJoin().subscribe((users) => {
            // When we join a proximity meeting, we start chatting
            this.mode = "chatting";

            this.startChat(users);
        });

        WA.player.proximityMeeting.onParticipantJoin().subscribe((user) => {
            this.remotePlayerJoined(user);
        });

        WA.player.proximityMeeting.onLeave().subscribe(() => {
            // When we leave a proximity meeting, we stop chatting
            this.mode = "waiting";
        });

        WA.chat.onChatMessage((message, event) => {
            (async () => {
                if (this.mode !== "chatting") {
                    console.warn("Received a chat message while not in chatting mode: ", message, event);
                    return;
                }

                if (!event.author) {
                    // We are receiving our own message, let's ignore it.
                    return;
                }

                this.chatHistory.push({
                    role: "user",
                    player: event.author,
                    content: event.author.name + ": " + message,
                });

                const response = await this.triggerGpt();

                WA.chat.sendChatMessage(response, {
                    scope: "bubble",
                });
            })().catch(e => console.error(e));
        }, {
            scope: "bubble",
        });
    }

    private async startChat(users: RemotePlayer[]) {

        if (this.chatHistory.length === 1) {
            const chatPrompt = await getChatPrompt(users);

            console.log("Sending prompt: ", chatPrompt);

            // TODO: only trigger the full script on first start
            // For subsequent starts, we should only send the new information about users.

            this.chatHistory = [{
                role: "system",
                content: chatPrompt,
            }];

            const response = await this.triggerGpt();

            WA.chat.sendChatMessage(response, {
                scope: "bubble",
            });
        }
    }

    private async triggerGpt() {
        const messages = this.chatHistory.map(message => {
            return {
                role: message.role,
                content: message.role === "user" ? message.player.name + ": " + message.content : message.content,
            }
        });

        WA.chat.startTyping({
            scope: "bubble",
        });

        const chatCompletion = await fetch('https://ai.newit.works/api/v1/openai/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer VJD869M-CJC4KMF-JRWJFJD-Z5RNYQJ`
            },
            body: JSON.stringify({
                messages,
                model: botName,
                stream: false,
                temperature: 1
            })
        }).then(response => response.json());

        const response = chatCompletion.choices[0]?.message.content;
        if (response === null || response === undefined) {
            throw new Error("Custom AI returned no response: " + JSON.stringify(chatCompletion))
        }
        console.log("Custom AI response:", response);

        WA.chat.stopTyping({
            scope: "bubble",
        });

        this.chatHistory.push({
            role: "assistant",
            content: response,
        });

        return response;
    }

    private async remotePlayerJoined(user: RemotePlayer) {
        // TODO: properly throttle this by adding players joining to a queue
        if (this.mode === "chatting") {
            this.chatHistory.push({
                role: "system",
                content: userJoinedChat(user),
            });

            const response = await this.triggerGpt();

            WA.chat.sendChatMessage(response, {
                scope: "bubble",
            });
        }
    }
}

export const robot = new Robot();