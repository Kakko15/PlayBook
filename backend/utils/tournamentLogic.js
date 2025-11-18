export const calculateElo = (eloA, eloB, scoreA, k) => {
  const expectedA = 1 / (1 + Math.pow(10, (eloB - eloA) / 400));
  const expectedB = 1 / (1 + Math.pow(10, (eloA - eloB) / 400));

  const newEloA = Math.round(eloA + k * (scoreA - expectedA));
  const newEloB = Math.round(eloB + k * (1 - scoreA - expectedB));

  return [newEloA, newEloB];
};
