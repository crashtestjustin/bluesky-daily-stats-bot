import fetch, { Headers, Response, Request } from "node-fetch"; // Polyfill fetch, Headers, Response, and Request
import { FormData } from "formdata-node"; // Polyfill FormData
import { authenticateAgent } from "./authenticating/authenticateAgent.js";

// Polyfill fetch, Headers, FormData, Request, and Response for the Node.js environment
globalThis.Headers = Headers;
globalThis.fetch = fetch;
globalThis.FormData = FormData;
globalThis.Response = Response;
globalThis.Request = Request;

export const likeCreatorPosts = async () => {
  const agent = await authenticateAgent();
  console.log("LIKER connected successfully");

  //get posts from jde.blue from the last 24 hours
  const cutOfftime = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  let cursor = null;
  let allPosts = [];
  do {
    const response = await agent.app.bsky.feed.getAuthorFeed({
      actor: "jde.blue",
    });

    const posts = response.data.feed;

    const recentPosts = posts.filter((post) => {
      const postTime = new Date(post.post.record.createdAt).toISOString();
      return postTime >= cutOfftime;
    });

    allPosts = allPosts.concat(recentPosts);
  } while (cursor);

  for (const post of allPosts) {
    //check to make sure the post is not a reply
    if (!post.post.record.reply) {
      //check to see if the agent I am using liked the post
      const viewer = post.post.viewer;

      //if not like the post
      if (!viewer.like) {
        console.log(`Liking post: ${post.post.uri}`);
        try {
          const { uri } = await agent.like(post.post.uri, post.post.cid);
          console.log(`Successfully liked post: ${post.post.uri}`);
        } catch (error) {
          console.error(`Failed to like post ${post.post.uri}:`, error);
        }
      } else {
        console.log(`Already liked post: ${post.post.uri}`);
      }
    }
  }
};

likeCreatorPosts().catch(console.error);
