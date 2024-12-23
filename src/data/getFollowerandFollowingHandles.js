export const getFollowersAndFollowingHandles = async (
  accountPDS,
  accessJwt,
  handles
) => {
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const fetchHandles = async (url, paramsKey, resultKey, actor) => {
    let handles = [];
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
            Authorization: `Bearer ${accessJwt}`,
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
        handles.push(...data[resultKey].map((item) => item.handle));
        cursor = data.cursor || null;

        await delay(500); // Add delay to avoid rate limits
      } catch (error) {
        console.error(`Failed to fetch handles: ${error.message}`);
        break; // Exit loop on failure
      }
    } while (cursor);

    return handles;
  };

  // Fetch followers and following for each handles of handles and return as an object layered
  const result = {};

  for (const actor of handles) {
    try {
      const [followers, following] = await Promise.all([
        fetchHandles(
          "app.bsky.graph.getFollowers",
          "followers",
          "followers",
          actor
        ),
        fetchHandles("app.bsky.graph.getFollows", "follows", "follows", actor),
      ]);

      result[actor] = { followers, following };
    } catch (error) {
      console.error(`Error processing actor ${actor}:`, error);
      result[actor] = { followers: [], following: [] }; // Fallback for errors
    }
  }

  return result;
};
