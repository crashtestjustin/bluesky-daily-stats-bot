import { AtpAgent } from "@atproto/api";
import dotenv from "dotenv";

dotenv.config();

export const authenticateAgent = async () => {
  const agent = new AtpAgent({
    service: "https://bsky.social",
  });
  await agent.login({
    identifier: process.env.BLUESKY_USERNAME,
    password: process.env.BLUESKY_PASSWORD,
  });
  console.log("Authenticated successfully");
  // console.log(agent);
  return agent;
};
