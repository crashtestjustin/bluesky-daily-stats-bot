export const getConvoForMembers = async (
  accountPDS,
  session,
  recipientDid,
  botDid
) => {
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const fetchData = async (url, membersArray) => {
    let data = [];
    let cursor = null;

    do {
      try {
        const params = new URLSearchParams();
        membersArray.forEach((member) => params.append("members", member));

        const response = await fetch(`${accountPDS}/xrpc/${url}?${params}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.accessJwt}`,
            "Content-Type": "application/json",
            "Atproto-Proxy": "did:web:api.bsky.chat#bsky_chat",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error Response Data:", errorData);
          throw new Error(
            `Error fetching ${url}: ${response.status} - ${errorData?.error}`
          );
        }

        const responseData = await response.json();

        data.push(responseData);
        cursor = data.cursor || null;

        await delay(500); // Add delay to avoid rate limits
      } catch (error) {
        console.error(`Failed to fetch data: ${error.message}`);
        break; // Exit loop on failure
      }
    } while (cursor);

    return data;
  };

  const membersArray = [recipientDid, botDid];
  const convo = await fetchData(
    "chat.bsky.convo.getConvoForMembers",
    membersArray
  );

  return convo[0].convo;
};
