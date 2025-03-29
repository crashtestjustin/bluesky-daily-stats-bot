export const getConvoForMembers = async (
  accountPDS,
  session,
  recipientDid,
  botDid
) => {
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const fetchData = async (url, membersArray) => {
    let data = [];

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
      return responseData;
    } catch (error) {
      console.error(`Failed to fetch data: ${error.message}`);
      return null;
    }
  };

  const membersArray = [recipientDid, botDid];
  const convo = await fetchData(
    "chat.bsky.convo.getConvoForMembers",
    membersArray
  );

  return convo.convo;
};
