function arraysMatchUnordered(arr1, arr2) {
  if (arr1.length !== arr2.length) return false; // Check lengths first
  return arr1
    .slice()
    .sort()
    .every((value, index) => value === arr2.slice().sort()[index]);
}

export const getPersonalBotConvo = (convoData) => {
  const targetParticipants = ["jde.blue", "crashtestjustin.bsky.social"];

  targetParticipants.sort();

  let targetConvo = {};
  for (const convo of convoData) {
    let membersHandles = [];
    for (let i = 0; i < convo.members.length; i++) {
      membersHandles.push(convo.members[i].handle);
      membersHandles.sort();
    }
    const match = arraysMatchUnordered(targetParticipants, membersHandles);

    if (match) {
      targetConvo = {
        convo: convo,
      };
    }
  }

  return targetConvo;
};
