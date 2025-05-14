import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import Contest from "../models/contest.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import Problem from "../models/problem.model.js";
import Solution from "../models/solution.model.js";

const submitSolution = asyncHandler(async (req: Request, res: Response) => {
  //TODO:
  // 1. Validate the user is participant or not
  // 2. Validate that the user is a participant of the contest
  // 3. get the contest id from the params
  // 4. get the problem id from the params
  // 5. get the problem solution information from the request body
  // 5.5. update the score of problem and the contest
  // 6. update the solution id to the user's submitted problems
  // 6.5. update the problem id in the solution
  // 6.6. update the solution id in the problem
  // 7. show the success message

  const userId = (req as any).user._id;
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }
  if (user.role !== "participant") {
    throw new ApiError(403, "You are not authorized to join a contest");
  }

  const { contestId, problemId } = req.params;
  const contest = await Contest.findById(contestId);

  if (!contest) {
    throw new ApiError(404, "Contest not found");
  }
  const isParticipant = contest.participants.find(
    (participant) => participant.userId.equals(userId)
  );
  
  
  if (!isParticipant) {
    throw new ApiError(
      403,
      "You are not a participant of the Contest. Join the contest first."
    );
  }
  

  const problem = await Problem.findById(problemId);
  if (!problem) throw new ApiError(404, "Problem not found");
  const problemID = problem._id;

  const isProblemInContest = contest.problems.some((p) => p.equals(problemId));
  if (!isProblemInContest) {
    throw new ApiError(404, "Problem does not belong to this contest");
  }

  const {
    score,
    solutionCode,
    languageUsed,
    timeOccupied,
    memoryOccupied,
    timeGivenOnSolution,
  } = req.body;

  const solution = new Solution({
    problemId,
    score,
    solutionCode,
    languageUsed,
    timeOccupied,
    memoryOccupied,
    timeGivenOnSolution,
  });

  await solution.save();

  problem.solution = solution._id;
  problem.isSolved = true;
  await problem.save();

  const contestIndex = user.contestsParticipated.findIndex(
    (c) => c.contestId && c.contestId.equals(contestId)
  );
  

  if (contestIndex === -1) {
    throw new ApiError(
      404,
      "Contest not found in user's participated contests"
    );
  }

  user.contestsParticipated[contestIndex].score =
    (user.contestsParticipated[contestIndex].score || 0) + score;

  user.solvedProblems.push({
    problemId: problem._id as mongoose.Types.ObjectId,
    solvedAt: new Date(),
  });
  await user.save();

  res
    .status(201)
    .json(new ApiResponse(201, solution, "Solution submitted successfully"));
});

// const getAllProblems = 

export { submitSolution };
