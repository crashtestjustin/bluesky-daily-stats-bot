import dotenv from "dotenv";

dotenv.config();

export const createSession = async () => {
  // Base64 encode the credentials
  const credentials = `${process.env.BLUESKY_USERNAME}:${process.env.BLUESKY_PASSWORD}`;
  const encodedCredentials = Buffer.from(credentials).toString("base64");

  const response = await fetch(
    "https://bsky.social/xrpc/com.atproto.server.createSession",
    {
      method: "POST",
      headers: {
        // identifier: process.env.BLUESKY_USERNAME,
        // password: process.env.BLUESKY_PASSWORD,
        Authorization: `Basic ${encodedCredentials}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identifier: process.env.BLUESKY_USERNAME,
        password: process.env.BLUESKY_PASSWORD,
      }),
    }
  );
  const session = await response.json();

  if (response.ok) {
    const requiredData = {
      did: session.did,
      accessJwt: session.accessJwt,
      refreshJwt: session.refreshJwt,
      service: session.didDoc.service,
    };

    console.log("Session created successfully");
    return requiredData;
  } else {
    console.error("Failed to create session:", session);
  }
};
