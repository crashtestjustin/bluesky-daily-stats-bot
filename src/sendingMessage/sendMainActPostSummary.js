import { fetchPosts } from "../data/getDailyPostStats.js";

//function to get main post data for the day and send out a message that summarizes engagement
export async function sendAccountPostSummary(
  handles,
  session,
  accountPDS,
  conversations,
  proxyHeader
) {
  const engagementStats = {};
  for (const handle of handles) {
    //GET posts from past 24 hours as an array
    const userPosts = await fetchPosts(
      "app.bsky.feed.getAuthorFeed",
      handle,
      accountPDS,
      session
    );
    // console.log(userPosts);
    //total up the posts engagement - likes, reposts, replies, number of posts

    const stats = {
      totalLike: 0,
      totalReposts: 0,
      totalReplies: 0,
      totalReplyOthers: 0,
      totalRepostOthers: 0,
    };

    for (const post of userPosts) {
      stats.totalLike += post.post.likeCount;
      stats.totalReplies += post.post.replyCount;
      stats.totalReposts += post.post.repostCount;
      post.post.record.embed && (stats.totalRepostOthers += 1);
      post.post.record.reply && (stats.totalReplyOthers += 1);
    }

    engagementStats[handle] = stats;
  }
  console.log(engagementStats);

  //START TESTING COMMENT OUT HERE
  // //send a message that summarizes the information
  // const sendUpdateMessage = async () => {
  //   const text = await messageText(stats);

  //   const url = "chat.bsky.convo.sendMessage";

  //   try {
  //     const resp = await fetch(`${accountPDS}/xrpc/${url}`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Accept: "application/json",
  //         Authorization: `Bearer ${session.accessJwt}`,
  //         "Atproto-Proxy": proxyHeader,
  //       },
  //       body: JSON.stringify({
  //         convoId: convoId,
  //         message: {
  //           text: text,
  //         },
  //       }),
  //     });

  //     const respsonse = await resp.json();
  //     if (resp.ok) {
  //       // console.log("message sent successfully", respsonse);
  //       console.log("posts summary message sent successfully");
  //     } else {
  //       console.log("issue sending messsage", respsonse);
  //     }
  //   } catch (error) {
  //     console.error("Error occurred while sending the message:", error);
  //   }
  // };

  // const messageText = (stats) => {
  //   return `
  //   ---- 🙌Your personal post summary for today💪 ----\n\n${
  //     stats.totalLike > 0
  //       ? `• Total likes on posts: ${stats.totalLike}`
  //       : "• No likes on posts today"
  //   }\n${
  //     stats.totalReplies > 0
  //       ? `• Total replies on posts: ${stats.totalReplies} `
  //       : "• No replies on posts today"
  //   }\n${
  //     stats.totalReposts > 0
  //       ? `• Total reposts on posts: ${stats.totalReposts}`
  //       : "• No reposts of your posts today"
  //   }\n\nOn your end, you replied to ${
  //     stats.totalReplyOthers
  //   } posts and reposts/quote posted ${stats.totalRepostOthers} posts!
  //   `;
  // };

  // const summaryMessage = sendUpdateMessage();
  //END TESTING COMMENT OUT HERE
}
