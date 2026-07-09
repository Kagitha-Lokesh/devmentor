/**
 * Enumeration for user active recall ratings during revision.
 * Maps directly to SM-2 memory evaluation ratings.
 */
export const RevisionRating = {
  Again: 0, // Complete blackout/incorrect
  Hard: 1,  // Incorrect but familiar, or correct after hesitation
  Good: 2,  // Correct with medium effort
  Easy: 3   // Correct instantly with high confidence
};

export default RevisionRating;
