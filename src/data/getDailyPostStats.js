const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchPosts = async (url, actor, accountPDS, session) => {
  let cursor = null;
  let posts = [];

  // do {
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

    const respData = await response.json();
    cursor = respData.cursor;

    const yesterday = new Date(Date.now() - 1000 * 60 * 60 * 24);

    const recentPosts = respData.feed.filter((post) => {
      const datePosted = new Date(post.post.record.createdAt);
      return datePosted >= yesterday;
    });

    posts = posts.concat(recentPosts);

    await delay(500); // Add delay to avoid rate limits
  } catch (error) {
    console.error(`Failed to fetch handles: ${error.message}`);
    // break; // Exit loop on failure
  }
  // } while (cursor);
  return posts;
};
