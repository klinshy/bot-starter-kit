
console.log('Script started successfully');
let botName: string;

WA.onInit().then(async () => {
    botName = await WA.player.name;
})

export { botName };

// PLACES.TS
let placesPromise: Promise<Map<string, string | undefined>> | undefined;

export async function findPlaces(): Promise<Map<string, string | undefined>> {
    if (placesPromise !== undefined) {
        return placesPromise;
    }

    return new Promise(async (resolve) => {
        const zones = new Map<string, string | undefined>();

        const layers = await getLayersMap();
        for (const layer of layers.values()) {
            if (layer.type === 'objectgroup') {
                for (const object of layer.objects) {
                    if (object.type === 'area' || object.class === 'area') {
                        const properties = new Properties(object.properties);
                        if (properties.getBoolean('ai-zone') === true) {
                            zones.set(object.name, properties.getString('description'));
                        }
                    }
                }
            }
        }

        resolve(zones);
    });
}

export async function generatePlacesPrompt(): Promise<string> {
    const zones = await findPlaces();

    let prompt = "In your map, you can find the following places:\n\n";

    for (const [name, description] of zones.entries()) {
        prompt += `- ${name}: ${description}\n`;
    }

    return prompt;
}

export async function updateMyPlace(): Promise<void> {
    const places = await findPlaces();
    for (const areaName of places.keys()) {
        WA.room.area.onEnter(areaName).subscribe(() => {
            WA.player.state.saveVariable('currentPlace', areaName, {
                persist: false,
                public: true,
            });
        });
    }
}

// PEOPLE.TS
export function findPeopleByPlace(): Map<string | undefined, Array<RemotePlayerInterface>> {
    const players = WA.players.list();

    // TODO: deduplicate users name. If 2 users have the same name, let's rename one.

    const peopleByPlace = new Map<string | undefined, Array<RemotePlayerInterface>>();

    for (const player of players) {
        const placeResult = z.string().optional().safeParse(player.state.currentPlace);
        if (placeResult.success === false) {
            console.warn("Invalid place for a player: ", player.state.currentPlace);
            continue;
        }
        const place = placeResult.data ?? "corridor";

        let people = peopleByPlace.get(place);
        if (people === undefined) {
            people = [];
            peopleByPlace.set(place, people);
        }
        people.push(player);
    }

    return peopleByPlace;
}

export function generatePeopleByPlacesPrompt(): string {
    const peopleByPlace = findPeopleByPlace();

    let prompt = "In your map, you can find the following people:\n\n";

    const formatter = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' });

    for (const [place, people] of peopleByPlace.entries()) {
        prompt += `- ${formatter.format(people.map(person => person.name))} ${people.length === 1 ? "is" : "are"} in ${place}\n`;
    }

    return prompt;
}

export function isTeamMember(player: RemotePlayerInterface): boolean {
    const tagsResult = z.string().array().optional().safeParse(player.state.tags);
    if (!tagsResult.success) {
        console.warn("Invalid tags for a player: ", player.state.tags);
        return false;
    }
    const tags = tagsResult.data ?? [];

    return tags.includes("member");
}

export function findPeopleByRole(): {
    "visitors": Array<RemotePlayerInterface>,
    "coworkers": Array<RemotePlayerInterface>,
} {
    const players = WA.players.list();
    // TODO: deduplicate users name. If 2 users have the same name, let's rename one.

    const visitors = new Array<RemotePlayerInterface>();
    const coworkers = new Array<RemotePlayerInterface>();

    for (const player of players) {
        if (isTeamMember(player)) {
            coworkers.push(player);
        } else {
            visitors.push(player);
        }
    }

    return {
        visitors,
        coworkers,
    }
}

export function generatePeopleByRolePrompt(): string {
    const peopleByRole = findPeopleByRole();

    const formatter = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' });

    const coworkers = peopleByRole['coworkers'];
    const visitors = peopleByRole['visitors'];

    let prompt = '';

    if (coworkers.length === 0) {
        prompt = "No one from your team is in this map.\n";
    } else if (coworkers.length === 1) {
        prompt = `${coworkers[0].name} is a coworker. He/she is part of your team.\n`;
    } else {
        prompt = `${formatter.format(peopleByRole['coworkers'].map(person => person.name))} are coworkers. They are part of your team and work in this map.\n`;
    }

    if (visitors.length === 0) {
        prompt = "There are no visitors in this map.\n";
    } else if (visitors.length === 1) {
        prompt = `${visitors[0].name} is a visitor.\n`;
    } else {
        prompt = `${formatter.format(peopleByRole['visitors'].map(person => person.name))} are visitors.\n`;
    }

    return prompt;
}

// MOVEPROMPT.TS
export async function getMovePrompt(): Promise<string> {
    return `You are a bot living in a WorkAdventure map.
Your job is to welcome visitors. In priority, you should welcome visitors entering the lobby.

${await generatePlacesPrompt()}
${generatePeopleByPlacesPrompt()}
${generatePeopleByRolePrompt()}

Please tell me who you are going to greet.
You should answer in the format "Go to <name>" where <name> is the name of the person you are greeting.
Please answer only this and nothing else.
    `;
}

// CHATPROMPT.TS
const formatter = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' });

function usersList(users: RemotePlayer[]): string {
    return formatter.format(users.map(user => user.name));
}

export async function getChatPrompt(users: RemotePlayer[]): Promise<string> {
    return `You are a bot living in a WorkAdventure map.
You are currently chatting with ${usersList(users)}. You are engaged in a chat, please keep your answers short and to the point.
In this conversation, you can offer to go to a place or to go to a person. I will now describe the places and people you can find in this map.

${await generatePlacesPrompt()}
${generatePeopleByPlacesPrompt()}
${generatePeopleByRolePrompt()}

If you are talking to a visitor, you can direct them to one of the team members if they are present in the room. If you do so, please direct them to the
person whose skills match the best the visitor's needs.
If no team member is present in the room, you can offer the visitors to come back at office hours (9:00 to 18:00, Paris time, on working days).

Because there are many people in this chat, when someone is talking to you, the message sent will be prefixed by the name of the person talking to you.
When you answer, do not put any prefix.

You start first. Please engage the conversation with a short welcome message.
`;
}

export function userJoinedChat(user: RemotePlayer): string {
    return `${user.name} joined the chat. ${user.name} is a ${isTeamMember(user) ? "coworker" : "visitor"}. You can welcome him/her and make a summary of the conversation you were having.`;
}

// ROBOT.TS
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

// MAIN.TS
WA.onInit().then(async () => {
    console.log('Scripting API ready');
    console.log('Player tags: ', WA.player.tags)

    // The line below bootstraps the Scripting API Extra library that adds a number of advanced properties/features to WorkAdventure
    await bootstrapExtra();
    console.log('Scripting API Extra ready');

    // Needed to avoid a bug in FF
    // Not sure why but the iframe is not always correctly registered in the IFrameListener.
    //await new Promise(resolve => setTimeout(resolve, 1000));

    await WA.players.configureTracking({
        players: true,
        movement: true,
    });

    await updateMyPlace();

    // Let's initialize the "tags" variable to expose our tags to others
    await WA.player.state.saveVariable('tags', WA.player.tags, {
        persist: false,
        public: true,
    });

    if (WA.room.hashParameters.bot) {
        robot.init();
    }

}).catch(e => console.error(e));

export {};