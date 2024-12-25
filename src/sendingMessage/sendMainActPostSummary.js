import { fetchPosts } from "../data/getDailyPostStats.js";

//function to get main post data for the day and send out a message that summarizes engagement
export async function sendAccountPostSummary(
  handles,
  session,
  accountPDS,
  proxyHeader
) {
  const engagementStats = {};
  for (const handle of Object.keys(handles)) {
    if (handle === "mainAcct") {
      continue;
    } else {
      //GET posts from past 24 hours as an array
      const userPosts = await fetchPosts(
        "app.bsky.feed.getAuthorFeed",
        handle,
        accountPDS,
        session
      );
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
  }

  const sendUpdateMessage = async (conversationId, stats, handle) => {
    const text = await messageText(stats, handle);

    const url = "chat.bsky.convo.sendMessage";

    try {
      const resp = await fetch(`${accountPDS}/xrpc/${url}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${session.accessJwt}`,
          "Atproto-Proxy": proxyHeader,
        },
        body: JSON.stringify({
          convoId: conversationId,
          message: {
            text: text,
          },
        }),
      });

      const respsonse = await resp.json();
      if (resp.ok) {
        console.log("posts summary message sent successfully to " + handle);
      } else {
        console.log("issue sending messsage", respsonse);
      }
    } catch (error) {
      console.error("Error occurred while sending the message:", error);
    }
  };

  const messageText = (stats, handle) => {
    return `🙌 @${handle}, your personal post summary for today🙌\n\nEngagement with your content:\n\n${
      stats.totalLike > 0
        ? `    • Total post likes for the day: ${stats.totalLike}`
        : "    • No likes on posts today"
    }\n${
      stats.totalReplies > 0
        ? `    • Total post replies for the day: ${stats.totalReplies} `
        : "    • No replies on posts today"
    }\n${
      stats.totalReposts > 0
        ? `    • Total reposts for the day: ${stats.totalReposts}`
        : "    • No reposts of your posts today"
    }\n\nLet's not forget about how you engaged with others:\n${
      stats.totalReplyOthers > 0
        ? `    • You replied to ${stats.totalReplyOthers} posts!`
        : "    • You didn't reply to anyone's posts"
    }\n${
      stats.totalRepostOthers > 0
        ? `    • You reposted ${stats.totalRepostOthers} posts from other users!`
        : "    • You didn't repost anyone's posts"
    }`;
  };

  //send a message that summarizes the information by iterating throught the engagement stats object keys
  for (const handle of Object.keys(engagementStats)) {
    const stats = engagementStats[handle];

    try {
      sendUpdateMessage(handles[handle].convoWithBotAcct.id, stats, handle);
    } catch (error) {
      console.log(
        "Error sending Update message for handle " + handle + ".",
        error
      );
    }
  }
}
