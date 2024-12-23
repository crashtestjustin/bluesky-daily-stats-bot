import fs from "fs";

// Function to store data in a JSON file
export const storeHandle = (handle) => {
  const currentTime = new Date().getTime();
  const data = handle;

  const previousData = loadPreviousData();

  const updatedData = [...previousData, data];

  fs.writeFileSync("handles.json", JSON.stringify(updatedData, null, 2));
};

// Function to load the previous data
export const loadHandles = () => {
  try {
    const rawData = fs.readFileSync("handles.json", "utf-8");
    return JSON.parse(rawData);
  } catch (error) {
    if (error.code === "ENOENT") {
      // File not found, return empty array
      return [];
    } else {
      throw error; // Re-throw for unexpected errors
    }
  }
};
