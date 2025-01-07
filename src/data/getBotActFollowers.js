import { getConvoForMembers } from "./getConvoIDForMembers.js";
import dotenv from "dotenv";

dotenv.config();

export const getFollowers = async (accountPDS, session, actor) => {
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const fetchFollowers = async (url, actor) => {
    let followers = [];
    let cursor = null;

    do {
      try {
        const params = new URLSearchParams({
          actor: actor,
          limit: "100",
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

        followers.push(data);
        cursor = data.cursor || null;

        await delay(500); // Add delay to avoid rate limits
      } catch (error) {
        console.error(`Failed to fetch followers: ${error.message}`);
        break; // Exit loop on failure
      }
    } while (cursor);

    return followers;
  };

  const followers = await fetchFollowers(
    "app.bsky.graph.getFollowers",
    // "crashtestjustin.bsky.social"
    process.env.BLUESKY_USERNAME
  );

  // console.log("ALL FOLLOWERS", followers[0]);
  // console.log("MAIN ACCT", followers[0].followers);

  const followerHandles = {
    mainAcct: {
      handle: followers[0].subject.handle,
      name: followers[0].subject.displayName,
      did: followers[0].subject.did,
    },
  };

  for (const follower of followers[0].followers) {
    const convo = await getConvoForMembers(
      accountPDS,
      session,
      follower.did,
      followers[0].subject.did
    );

    followerHandles[follower.handle] = {
      handle: follower.handle,
      name: follower.displayName,
      did: follower.did,
      convoWithBotAcct: convo,
    };
  }

  return followerHandles;
};
