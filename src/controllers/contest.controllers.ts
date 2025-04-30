import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { IContest } from "../types/contest.types.js";
import Contest from "../models/contest.model.js";
import { IUser } from "../types/user.types.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";

const createContest = asyncHandler(async (req: Request, res: Response) => {
    //TODO: 
    //1. Validate that the user who is creating is admin or not
    //2. From the request body, get the userId of the user who is creating the contest
    //3. Create a new contest with the details provided in the request body
    //4. Save the contest to the database
    //5. Add the contestId to the user's contestsCreated array
    //6. Return the created contest as a response
    const { title, description, startTime, endTime, duration, problems, isRated, tags, rules } = req.body;
    const userId = req.user?._id; // Ensure req.user is properly typed
    const user = await User.findById(userId);
    if (!user || user.role !== "admin") {
        throw new ApiError(403, "You are not authorized to create a contest");
    }
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

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $push: { contestsCreated: contest._id } },
        { new: true }
    );
    if (!updatedUser) {
        throw new ApiError(500, "Something went wrong while updating the user");
    }
    res
        .status(201)
        .json(new ApiResponse(201, contest, "Contest created successfully"));
})

const joinContest = asyncHandler(async (req: Request, res: Response) => {
    //TODO:
    //1. Validate that the user is participant
    //2. From the request params get the contestId
    //3. Now search the contest from the database
    //4. If contest is not found, return 404
    //5. If contest is found, check if the user is already a participant
    //6. If user is already a participant, return 409
    //7. If user is not a participant, add the userId to the participants array of the contest
    //8. Add the contestId to the user's contestsParticipated array
    //9. Return the updated contest as a response

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
    const alreadyParticipant = contest.participants.some(p =>
        p.userId.equals(userId)
    );
    if (alreadyParticipant) {
        throw new ApiError(409, "You are already a participant in this contest");
    }

    // Push as an IParticipant object
    contest.participants.push({
        userId,
        joinedAt: new Date(),
    });

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $push: { contestsParticipated: contest._id } },
        { new: true }
    );

    if (!updatedUser) {
        throw new ApiError(500, "Something went wrong while updating the user");
    }

        await contest.save();
    
        res.status(200).json(
            new ApiResponse(200, contest, "Contest joined successfully")
        );
    });
    
    const getAllContests = asyncHandler(async (req: Request, res: Response) => {
        //TODO:
        //1. Get all the contests from the database
        //2. Return the contests as a response
        const contests = await Contest.find();
        res
            .status(200)
            .json(new ApiResponse(200, contests, "Contests retrieved successfully"));
    });
    
    export { createContest, joinContest, getAllContests };