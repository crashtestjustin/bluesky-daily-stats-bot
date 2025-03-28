import { getConvoForMembers } from "./getConvoIDForMembers.js";
import dotenv from "dotenv";

dotenv.config();

export const getFollowers = async (accountPDS, session, actor) => {
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const fetchFollowers = async (url, actor) => {
    let followers = [];
    let cursor = undefined;
    let subject = undefined; // Store the main account's data

    do {
      try {
        const params = new URLSearchParams({
          actor: actor,
          limit: "50",
          ...(cursor && { cursor }),
        });

        const response = await fetch(`${accountPDS}/xrpc/${url}?${params}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.accessJwt}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `Error fetching ${url}: ${response.status} - ${errorData?.error}`
          );
        }

        const data = await response.json();

        if (!subject) {
          subject = data.subject; // Save main account info from the first response
        }

        // followers.push(data);
        followers = [...followers, ...data.followers];
        cursor = data.cursor || undefined;

        await delay(500); // Add delay to avoid rate limits
      } catch (error) {
        console.error(`Failed to fetch followers: ${error.message}`);
        break; // Exit loop on failure
      }
    } while (cursor);

    // return followers;
    return { followers, subject }; // Return both followers and subject
  };

  const { followers, subject } = await fetchFollowers(
    "app.bsky.graph.getFollowers",
    // "crashtestjustin.bsky.social"
    process.env.BLUESKY_USERNAME
  );

  const followerHandles = {
    mainAcct: {
      handle: subject.handle,
      name: subject.displayName,
      did: subject.did,
    },
  };

  for (const follower of followers) {
    if (
      follower.associated &&
      follower.associated.chat.allowIncoming === "none"
    ) {
      console.log(
        `${follower.handle} does not accdept incoming chat messages. Skipping them`
      );
    } else {
      const convo = await getConvoForMembers(
        accountPDS,
        session,
        follower.did,
        subject.did
      );

      followerHandles[follower.handle] = {
        handle: follower.handle,
        name: follower.displayName,
        did: follower.did,
        convoWithBotAcct: convo,
      };
    }
  }

  return followerHandles;
};
