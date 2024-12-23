import fetch, { Headers, Response, Request } from "node-fetch"; // Polyfill fetch, Headers, Response, and Request
import { FormData } from "formdata-node"; // Polyfill FormData

// Polyfill fetch, Headers, FormData, Request, and Response for the Node.js environment
globalThis.Headers = Headers;
globalThis.fetch = fetch;
globalThis.FormData = FormData;
globalThis.Response = Response;
globalThis.Request = Request;

import dotenv from "dotenv";
import cron from "node-cron";
import { authenticateAgent } from "./authenticating/authenticateAgent.js";
import { createSession } from "./authenticating/createSession.js";
import { getPersonalBotConvo } from "./matching and getting data/findMatchingConvo.js";
import { compareFollowData } from "./matching and getting data/compareToPriorFollowData.js";
import { getFollowersAndFollowingHandles } from "./data/getFollowerandFollowingHandles.js";
import { sendUpdateMessage } from "./sendingMessage/sendSummary.js";
import { loadHandles } from "./data/readWriteHandles.js";
import { sendAccountPostSummary } from "./sendingMessage/sendMainActPostSummary.js";

dotenv.config();

export const run = async () => {
  const session = await createSession();
  const accountPDS = session.service[0].serviceEndpoint;
  const listConvosUrl = "chat.bsky.convo.listConvos";
  const proxyHeader = "did:web:api.bsky.chat#bsky_chat";

  try {
    //get conversations in chat for bot account
    const resp = await fetch(`${accountPDS}/xrpc/${listConvosUrl}`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${session.accessJwt}`,
        "Atproto-Proxy": "did:web:api.bsky.chat#bsky_chat",
      },
    });
    const data = await resp.json();

    // const conversation = getPersonalBotConvo(data.convos);

    const conversations = data.convos;

    //create handle array of users to investigate and DM for subsequent actions
    const handleObject = loadHandles();
    const handles = handleObject.handles;

    //START COMMENT OUT FEATURE THAT IS NOT NEEDED FOR MVP
    // //get follows and followers
    // const followData = await getFollowersAndFollowingHandles(
    //   accountPDS,
    //   session.accessJwt,
    //   handles
    // );

    // console.log(followData);

    // // //get prior informatino from database (aka json file for now)
    // const difference = await compareFollowData(followData, handles);
    // // //send message summarizing changes to the same conversation id
    // const message = await sendUpdateMessage(
    //   handles,
    //   conversation.convo.id,
    //   accountPDS,
    //   proxyHeader,
    //   session.accessJwt,
    //   difference
    // );
    //END COMMENT OUT FEATURE THAT IS NOT NEEDED FOR MVP

    //GET main account posts for the today and compile the engagement to send as a separate messafe
    try {
      const summaryMessage = await sendAccountPostSummary(
        handles,
        session,
        accountPDS,
        conversations,
        proxyHeader
      );
    } catch (error) {
      console.log("Error sending the daily stats message", error);
    }
  } catch (error) {
    console.log("Error sending message", error);
  }
};

run().catch(console.error);
