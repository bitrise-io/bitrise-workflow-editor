const generateRandomEntityId = (existingIds: string[], prefix: string, i = 0) => {
  const potentialId = i === 0 ? prefix : `${prefix}_${i}`;
  if (existingIds?.includes(potentialId)) {
    return generateRandomEntityId(existingIds, prefix, i + 1);
  }
  return potentialId;
};

export default generateRandomEntityId;
