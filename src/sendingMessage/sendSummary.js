import { RichText } from "@atproto/api";
import { authenticateAgent } from "../authenticating/authenticateAgent.js";

export const sendUpdateMessage = async (
  handles,
  convoId,
  accountPDS,
  proxyHeader,
  accessJwt,
  followChanges
) => {
  const agent = await authenticateAgent();
  const text = await messageText(followChanges, agent, handles);

  const url = "chat.bsky.convo.sendMessage";

  try {
    const resp = await fetch(`${accountPDS}/xrpc/${url}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accessJwt}`,
        "Atproto-Proxy": proxyHeader,
      },
      body: JSON.stringify({
        convoId: convoId,
        message: {
          text: text.text,
          facets: text.facets || [],
        },
      }),
    });

    const respsonse = await resp.json();
    if (resp.ok) {
      // console.log("message sent successfully", respsonse);
      console.log("message sent successfully");
    } else {
      console.log("issue sending messsage", respsonse);
    }
  } catch (error) {
    console.error("Error occurred while sending the message:", error);
  }
};

const messageText = async (followChanges, agent, handles) => {
  const textObj = {};

  for (const account of Object.keys(followChanges)) {
    const changes = followChanges[account];

    // const newFollowersString = changes.newFollowers
    //   .map((follower) => `@${follower}`)
    //   .join(", ");
    // const newFollowingString = changes.newFollowing
    //   .map((following) => `@${following}`)
    //   .join(", ");
    // const lostFollowersString = changes.lostFollowers
    //   .map((follower) => `@${follower}`)
    //   .join(", ");
    // const lostFollowingString = changes.newUnFollows
    //   .map((following) => `@${following}`)
    //   .join(", ");

    const limit = 5;

    const getChangeString = (changes, type) => {
      const displayedChanges = changes
        .slice(0, limit)
        .map((item) => `@${item}`);
      const remainingCount = changes.length - limit;

      if (remainingCount > 0) {
        displayedChanges.push(`+ ${remainingCount} more`);
      }

      return displayedChanges.join(", ");
    };

    const newFollowersString = getChangeString(
      changes.newFollowers,
      "newFollowers"
    );
    const newFollowingString = getChangeString(
      changes.newFollowing,
      "newFollowing"
    );
    const lostFollowersString = getChangeString(
      changes.lostFollowers,
      "lostFollowers"
    );
    const lostFollowingString = getChangeString(
      changes.newUnFollows,
      "lostFollowing"
    );

    let text;

    if (account === "jde.blue") {
      text = `Hey Justin,\n\nHere's a summary of the connection changes for @${account} over the last 24 hours:\n\nNew Followers: ${
        newFollowersString ? newFollowersString : "NONE🙅"
      }\nNew Follows: ${
        newFollowingString ? newFollowingString : "NONE🙅"
      }\nLost Followers: ${
        lostFollowersString ? lostFollowersString : "NONE🙅"
      }\nUnfollowed Accounts: ${
        lostFollowingString ? lostFollowingString : "NONE🙅"
      }`;
    } else {
      text = `--- 24 hour changes for @${account} ---\n\nNew Followers: ${
        newFollowersString ? newFollowersString : "NONE🙅"
      }\nNew Follows: ${
        newFollowingString ? newFollowingString : "NONE🙅"
      }\nLost Followers: ${
        lostFollowersString ? lostFollowersString : "NONE🙅"
      }\nUnfollowed Accounts: ${
        lostFollowingString ? lostFollowingString : "NONE🙅"
      }`;
    }

    textObj[account] = text;
  }

  // Ensure jde.blue is the first block
  const jdeBlueText = textObj["jde.blue"];
  delete textObj["jde.blue"]; // Remove jde.blue from the object

  // Concatenate the text string
  const textString = [
    jdeBlueText, // Add jde.blue text first
    ...Object.values(textObj), // Add the remaining text blocks
  ]
    .filter(Boolean) // Remove any undefined/null values
    .join("\n\n");

  const richText = new RichText({
    text: textString,
  });

  await richText.detectFacets(agent);
  console.log("grapheme lenght:", richText.graphemeLength);
  return { text: richText.text, facets: richText.facets };
};
