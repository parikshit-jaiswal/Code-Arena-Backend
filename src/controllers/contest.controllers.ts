import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { IContest } from "../types/contest.types.js";
import Contest from "../models/contest.model.js";
import { IUser } from "../types/user.types.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";
import Problem from "../models/problem.model.js";

const createContest = asyncHandler(async (req: Request, res: Response) => {
  const {
    title,
    description,
    startTime,
    endTime,
    duration,
    problems,
    isRated,
    tags,
    rules,
  } = req.body;

  const userId = req.user?._id; // Ensure req.user is properly typed
  const user = await User.findById(userId);

  if (!user || user.role !== "admin") {
    throw new ApiError(403, "You are not authorized to create a contest");
  }

  // Create the contest
  const contest = await Contest.create({
    title,
    description,
    organizer: userId,
    startTime,
    endTime,
    duration,
    problems,
    isRated,
    tags,
    rules,
  });

  // Push the entire contest details to the user's contestsCreated array
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $push: {
        contestsCreated: {
          contestId: contest._id,
          title: contest.title,
          description: contest.description,
          startTime: contest.startTime,
          endTime: contest.endTime,
          duration: contest.duration,
          problems: contest.problems,
          isRated: contest.isRated,
          tags: contest.tags,
          rules: contest.rules,
        },
      },
    },
    { new: true }
  );

  if (!updatedUser) {
    throw new ApiError(500, "Something went wrong while updating the user");
  }

  res
    .status(201)
    .json(new ApiResponse(201, contest, "Contest created successfully"));
});

const joinContest = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id as mongoose.Types.ObjectId;
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }
  if (user.role !== "participant") {
    throw new ApiError(403, "You are not authorized to join a contest");
  }

  const { contestId } = req.params;
  const contest = await Contest.findById(contestId);

  if (!contest) {
    throw new ApiError(404, "Contest not found");
  }

  // Check if the user is already a participant
  const alreadyParticipant = contest.participants.some((p) =>
    p.userId.equals(userId)
  );
  if (alreadyParticipant) {
    throw new ApiError(409, "You are already a participant in this contest");
  }

  // Add the user to the contest's participants array
  contest.participants.push({
    userId,
    joinedAt: new Date(),
  });

  // Add the contest to the user's contestsParticipated array
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $push: {
        contestsParticipated: {
          contestId: contest._id,
          title: contest.title,
          description: contest.description,
          startTime: contest.startTime,
          endTime: contest.endTime,
          duration: contest.duration,
          problems: contest.problems,
          isRated: contest.isRated,
          tags: contest.tags,
          rules: contest.rules,
        },
      },
    },
    { new: true }
  );

  if (!updatedUser) {
    throw new ApiError(500, "Something went wrong while updating the user");
  }

  // Save the updated contest
  await contest.save();

  res
    .status(200)
    .json(new ApiResponse(200, contest, "Contest joined successfully"));
});

const getAllContests = asyncHandler(async (req: Request, res: Response) => {
  //TODO:
  //1. Get all the contests from the database
  //2. Return the contests as a response

  const aggregatedContests = await Contest.aggregate([
    {
      $lookup: {
        from: "problems",
        localField: "problems",
        foreignField: "_id",
        as: "problems",
      }
    },
  ])
  if (!aggregatedContests) {
    throw new ApiError(404, "No contests found");
  }
  
  const contests = await Contest.find();
  res
    .status(200)
    .json(new ApiResponse(200, aggregatedContests, "Contests retrieved successfully"));
});

const addProblems = asyncHandler(async (req: Request, res: Response) => {
  const { contestId } = req.params;
  const userId = req.user?._id as mongoose.Types.ObjectId;

  const {
    title,
    statement,
    inputFormat,
    outputFormat,
    constraints,
    sampleInput,
    sampleOutput,
    explanation,
    difficulty,
    tags,
    testCaseInput,
    testCaseOutput,
    testCaseExplanation,
    timeLimit,
    memoryLimit,
  } = req.body;

  const contest = await Contest.findById(contestId);
  if (!contest) {
    throw new ApiError(404, "Contest not found");
  }
  if (!contest.problems) {
    contest.problems = [];
  }
  if (
    !contest.organizer.equals(userId) &&
    !contest.moderators.some((mod: mongoose.Types.ObjectId) =>
      mod.equals(userId)
    )
  ) {
    throw new ApiError(403, "You are not authorized to edit the contest");
  }

  const problem = await Problem.create({
    title,
    statement,
    inputFormat,
    outputFormat,
    constraints,
    sampleInput,
    sampleOutput,
    explanation,
    difficulty,
    createdBy: userId,
    tags,
    testCases: {
      input: testCaseInput,
      output: testCaseOutput,
      explanation: testCaseExplanation,
    },
    timeLimit,
    memoryLimit,
  });

  if (!problem) {
    throw new ApiError(500, "Something went wrong while creating the problem");
  }

  contest.problems.push(problem._id as mongoose.Types.ObjectId);
  await contest.save();

  const updatedContest = await Contest.findById(contestId).populate("problems");

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        updatedContest,
        "Problem added to the contest successfully"
      )
    );
});

export { createContest, joinContest, getAllContests, addProblems };
