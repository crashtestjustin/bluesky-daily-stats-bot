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
    "crashtestjustin.bsky.social"
  );

  // console.log(followers[0].followers);

  const followerHandles = [];

  for (const follower of followers[0].followers) {
    followerHandles.push(follower.handle);
  }

  return followerHandles;
};
