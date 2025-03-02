export function generateFriendlyname(handle, displayName) {
  if (!displayName || typeof displayName !== "string") return handle;

  // Remove emojis and special characters
  const cleanName = displayName.replace(/[^a-zA-Z0-9\s|]/g, "").trim();

  // Handle names with separators like "|", take the part before the separator
  const separatorIndex = cleanName.indexOf("|");
  const primaryName =
    separatorIndex > -1 ? cleanName.split("|")[0].trim() : cleanName;

  // Split name into words
  const words = primaryName.split(/\s+/);
  // console.log(primaryName);
  // console.log(words);

  let friendlyName;

  if (words.length === 2) {
    // If the name is exactly two words, take the first word
    friendlyName = words[0];
  } else if (words.length <= 4) {
    // Retain full name if it's 4 words or fewer (and not 2 words)
    friendlyName = primaryName;
  } else {
    // For longer names, keep the first 2-3 meaningful words
    friendlyName = words.slice(0, 3).join(" ");
  }

  // Return the friendly name or fall back to the handle
  return friendlyName || handle;
}
