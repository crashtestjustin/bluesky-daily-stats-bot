import {
  loadPreviousData,
  storeFollowersAndFollows,
} from "../data/readWriteFollowData.js";

export const compareFollowData = async (followData, handles) => {
  const pastData = loadPreviousData();
  const result = {};

  for (const actor of handles) {
    try {
      const pastTargetData = pastData[actor] || {
        followers: [],
        following: [],
      };
      const currentFollowData = followData[actor];

      const currentFollowers = currentFollowData.followers || [];
      const currentFollowing = currentFollowData.following || [];
      const pastFollowers = pastTargetData.followers || [];
      const pastFollowing = pastTargetData.follows || [];

      // Compare followers
      const newFollowers = currentFollowers.filter(
        (follower) => !pastFollowers.includes(follower)
      );
      const lostFollowers = pastFollowers.filter(
        (follower) => !currentFollowers.includes(follower)
      );

      // Compare following
      const newFollowing = currentFollowing.filter(
        (follow) => !pastFollowing.includes(follow)
      );
      const newUnFollows = pastFollowing.filter(
        (follow) => !currentFollowing.includes(follow)
      );

      //update the json with the latest data for next day's comparison
      storeFollowersAndFollows(actor, currentFollowers, currentFollowing);

      result[actor] = {
        newFollowers,
        lostFollowers,
        newFollowing,
        newUnFollows,
      };
    } catch (error) {
      console.error(`Error processing actor ${actor}: ${error.message}`);
      result[actor] = {
        error: `Failed to process actor ${actor}`,
      };
    }
  }

  return result;
};
