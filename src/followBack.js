import fetch, { Headers, Response, Request } from "node-fetch"; // Polyfill fetch, Headers, Response, and Request
import { FormData } from "formdata-node"; // Polyfill FormData
import { authenticateAgent } from "../src/authenticating/authenticateAgent.js";

// Polyfill fetch, Headers, FormData, Request, and Response for the Node.js environment
globalThis.Headers = Headers;
globalThis.fetch = fetch;
globalThis.FormData = FormData;
globalThis.Response = Response;
globalThis.Request = Request;

export const followBack = async () => {
  const agent = await authenticateAgent();
  console.log("FB connected successfully");

  //get followers and follow them if not following
  const actorFollowers = await agent.app.bsky.graph.getFollowers({
    actor: process.env.BLUESKY_USERNAME,
  });

  for (const follower of actorFollowers.data.followers) {
    if (!follower.viewer.following) {
      try {
        await agent.follow(follower.did);
        console.log("successfully followed: ", follower.handle);
      } catch (error) {
        console.error("Error following user: ", error);
      }
    }
  }

  //get following and unfollow if they are not following me
  const actorFollowing = await agent.app.bsky.graph.getFollows({
    actor: process.env.BLUESKY_USERNAME,
  });

  for (const follower of actorFollowing.data.follows) {
    if (!follower.viewer.followedBy) {
      try {
        await agent.deleteFollow(follower.viewer.following);
        console.log("successfully unfollowed: ", follower.handle);
      } catch (error) {
        console.error("Error following user: ", error);
      }
    }
  }
};

followBack().catch(console.error);
