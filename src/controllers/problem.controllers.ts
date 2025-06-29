import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import Contest from "../models/contest.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import Problem from "../models/problem.model.js";
import Solution from "../models/solution.model.js";
import { IProblem } from "../types/problem.types.js";
import { IContest } from "../types/contest.types.js";
import { IUser } from "../types/user.types.js";

const submitSolution = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    //TODO:
    //1. get contestId and ProblemId from the params
    //2. find user and validate if it is a participant of the contest or not
    //3. get all the solution details from the req body
    //4. update problem score to take only the max value to be stored in problem score which is inside the contestParticipated array
    //5. update the contest score to be the sum of all the problems score
    //6. return the response
    //7. update the user rating based on the contest score
    //8. update the user rank based on the contest score
    //9. append the new rating by adding or subtracting the score based on the contest score
    //10. update the user global rank based on the new rating
    const { contestId, problemId } = req.params;

    const contest = await Contest.findById(contestId);
    const problem = await Problem.findById(problemId);
    const userId = (req as any).user._id;
    const user = await User.findById(userId);
    if (!contest) {
      throw new ApiError(404, "Contest not found");
    }
    if (!problem) {
      throw new ApiError(404, "Problem not found");
    }
    if (!userId) {
      throw new ApiError(404, "User not found");
    }
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Fix participant check
    const isParticipant = contest.participants.some(
      (p: any) => p.userId.toString() === userId.toString()
    );
    if (!isParticipant) {
      throw new ApiError(403, "User is not a participant of the contest");
    }
    const {
      score,
      solutionCode,
      languageUsed,
      timeOccupied,
      memoryOccupied,
      timeGivenOnSolution,
    } = req.body;
    if (!score) {
      throw new ApiError(400, "Score is required");
    }
    if (!solutionCode) {
      throw new ApiError(400, "Solution code is required");
    }

    if (!languageUsed) {
      throw new ApiError(400, "Language Used is required");
    }
    // if (!timeOccupied) {
    //   throw new ApiError(400, "Time Occupied is required");
    // }
    // if (memoryOccupied === undefined || memoryOccupied === null) {
    //   throw new ApiError(400, "Memory Occupied is required");
    // }
    // if (!timeGivenOnSolution) {
    //   throw new ApiError(400, "Time Given On Solution is required");
    // }
    const solution = await Solution.create({
      userId,
      contestId,
      problemId: new mongoose.Types.ObjectId(problemId),
      score,
      solutionCode,
      languageUsed,
      timeOccupied,
      memoryOccupied,
      timeGivenOnSolution,
    });
    if (!solution) {
      throw new ApiError(500, "Solution not created");
    }

    if (!Array.isArray(user.contestsParticipated)) {
      throw new ApiError(400, "User contestsParticipated is not a valid array");
    }

    const contestEntry = user.contestsParticipated.find(
      (c: any) => c?.contestId?.toString() === contestId
    );

    if (!contestEntry) {
      throw new ApiError(400, "User has not participated in this contest");
    }

    // Ensure contestProblems is always an array
    if (!Array.isArray(contestEntry.contestProblems)) {
      contestEntry.contestProblems = [];
    }

    // Find the contestProblem entry for this problem
    let problemEntry = contestEntry.contestProblems.find(
      (p: any) => p && p.problemId && p.problemId.toString() === problemId
    );

    const subStatus: "correct" | "wrong" | "partially correct" =
      score === problem.maxScore
        ? "correct"
        : score > 0
          ? "partially correct"
          : "wrong";

    if (!problemEntry) {
      // If not present, push a new entry
      contestEntry.contestProblems.push({
        problemId: new mongoose.Types.ObjectId(problemId),
        score,
        submissionTime: new Date(),
        submissionStatus: subStatus,
      });
    } else {
      // Update score to max of previous and new
      problemEntry.score = Math.max(problemEntry.score, score);
      problemEntry.submissionTime = new Date();
      problemEntry.submissionStatus = subStatus;
    }

    // Update contest score to sum of all contestProblems scores
    contestEntry.score = contestEntry.contestProblems.reduce(
      (acc: number, p: any) => acc + (p.score || 0),
      0
    );
    console.log("user rating:", user.ratingArray);
    // Update user rating based on contest score
    const previousRating = user.ratingArray[user.ratingArray.length - 1]?.rating || 1000; // Default rating if not set
    console.log("score:", score);
    const newRating = previousRating + contestEntry.score; // Simple addition for demo purposes
    //now append the new rating in the user rating array
    console.log("new rating:", newRating);
    user.ratingArray.push({
      rating: newRating,
      updatedAt: new Date(),
    });
    user.globalRank.push({
      rank: 0, // Placeholder for rank, you can calculate this later
      updatedAt: new Date(),
    });

    console.log("User: ", user);

    await user.save();

    res
      .status(201)
      .json(
        new ApiResponse(201, { user }, "Solution submitted and scores updated")
      );
  }
);

const getProblem = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user._id;
    const { contestId, problemId } = req.params;
    const contest = await Contest.findById(contestId);
    if (!contest) {
      throw new ApiError(404, "Contest not found");
    }
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    const isParticipant = contest.participants.some(
      (p: any) => p.userId.toString() === userId.toString()
    );
    if (!isParticipant) {
      throw new ApiError(403, "User is not a participant of the contest");
    }
    const problem = await Problem.findById(problemId);
    if (!problem) {
      throw new ApiError(404, "Problem not found");
    }
    res
      .status(200)
      .json(new ApiResponse(200, problem, "Problem fetched successfully"));
  }
);

const getProblemById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { problemId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(problemId)) {
    throw new ApiError(400, "Invalid problem ID");
  }
  const problem = await Problem.findById(problemId);
  if (!problem) {
    throw new ApiError(404, "Problem not found");
  }
  res.status(200).json(new ApiResponse(200, problem, "Problem fetched successfully"));
});

export { submitSolution, getProblem, getProblemById };
