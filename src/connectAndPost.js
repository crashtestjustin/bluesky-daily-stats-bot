import fetch, { Headers, Response, Request } from "node-fetch"; // Polyfill fetch, Headers, Response, and Request
import { FormData } from "formdata-node"; // Polyfill FormData

// Polyfill fetch, Headers, FormData, Request, and Response for the Node.js environment
globalThis.Headers = Headers;
globalThis.fetch = fetch;
globalThis.FormData = FormData;
globalThis.Response = Response;
globalThis.Request = Request;

import dotenv from "dotenv";
import { createSession } from "./authenticating/createSession.js";
import { compareFollowData } from "./matching and getting data/compareToPriorFollowData.js";
import { getFollowersAndFollowingHandles } from "./data/getFollowerandFollowingHandles.js";
import { sendUpdateMessage } from "./sendingMessage/sendSummary.js";
import { sendAccountPostSummary } from "./sendingMessage/sendMainActPostSummary.js";
import { getFollowers } from "./data/getBotActFollowers.js";

dotenv.config();

export const run = async () => {
  const session = await createSession();
  const accountPDS = session.service[0].serviceEndpoint;
  const proxyHeader = "did:web:api.bsky.chat#bsky_chat";

  try {
    //create handle object of followers w/ handle, did, and convoID DM in subsequent actions
    const followers = await getFollowers(accountPDS, session);
    const handles = followers;

    // let testHandles = { "jde.blue": handles["jde.blue"] };

    // console.log(testHandles);

    //testing chsnges start

    try {
      const summaryMessage = await sendAccountPostSummary(
        handles,
        // testHandles,
        session,
        accountPDS,
        proxyHeader
      );
    } catch (error) {
      console.log("Error sending the daily stats message", error);
    }

    //testing chsnges end

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
  } catch (error) {
    console.log("Error sending message", error);
  }
};

run().catch(console.error);
