import fs from "fs";

// Function to store data in a JSON file
export const storeFollowersAndFollows = (accountId, followers, follows) => {
  const currentTime = new Date().getTime();
  const data = {
    followers,
    follows,
    timestamp: currentTime,
  };

  const previousData = loadPreviousData();

  previousData[accountId] = data;

  fs.writeFileSync("followersData.json", JSON.stringify(previousData, null, 2));
};

// Function to load the previous data
export const loadPreviousData = () => {
  try {
    const rawData = fs.readFileSync("followersData.json");
    return JSON.parse(rawData);
  } catch (error) {
    return {}; // Return empty object if file doesn't exist
  }
};

// Example usage
// const accountId = "user123";

// // Store data (this could be done every 24 hours)
// storeFollowersAndFollows(
//   accountId,
//   ["user8", "user9", "user10"],
//   ["user66", "user33"]
// );

// // Load previous data
// const previousData = loadPreviousData();
// // console.log(previousData);
