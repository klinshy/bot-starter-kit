
//import { bootstrapExtra } from "@workadventure/scripting-api-extra";
//import {botName} from "./main";
export default {
    run: async (metadata: any) => {
  
    // The line below bootstraps the Scripting API Extra library that adds a number of advanced properties/features to WorkAdventure
    bootstrapExtra().then(() => {
        console.log('Scripting API Extra ready');}).catch(e => console.error(e));
        WA.onInit().then(async () => {
WA.chat.onChatMessage(
    async (message, event) => {
        if (!event.author) {
            // We are receiving our own message, let's ignore it.
            return;
        }

        try {
            WA.chat.startTyping({
                scope: "bubble"});
            const chatCompletion = await fetch('https://ai.newit.works/api/v1/openai/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer VJD869M-CJC4KMF-JRWJFJD-Z5RNYQJ`
                },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: message }],
                    model: botName,
                    stream: false,
                    temperature: 1
                })
            }).then(response => response.json());

            const response = chatCompletion.choices[0]?.message.content;
            if (response === null || response === undefined) {
                throw new Error("Custom AI returned no response: " + JSON.stringify(chatCompletion));
            }
            console.log("Custom AI response:", response);

            WA.chat.sendChatMessage(response, {
                scope: "bubble",
            });

            WA.chat.stopTyping({
                scope: "bubble",
            });
        } catch (e) {
            console.error(e);
        }
    },
    {
        scope: "bubble",
    }
)}),
    console.log("COUCOU", metadata);
}}