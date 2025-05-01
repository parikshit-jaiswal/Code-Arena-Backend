import { Request, Response } from "express";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { IUser } from "../types/user.types.js";
import { generateAccessAndRefreshTokens } from "../utils/tools.js";
import mongoose from "mongoose";


const registerAdmin = asyncHandler(async (req: Request, res: Response) => {
    const { username, email, password }: { username?: string; email?: string; password?: string } = req.body;
    const role: String = "admin";

    if (!username || !email || !password) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    const admin = await User.create({
        username,
        email,
        password,
        role,
    });

    const createdAdmin = await User.findById(admin._id).select("-password -refreshToken -rating -contestsParticipated -solvedProblems");

    if (!createdAdmin) {
        throw new ApiError(500, "Something went wrong while registering the admin");
    }

    res.status(201).json(new ApiResponse(201, createdAdmin, "Admin registered successfully"));
});

const loginAdmin = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password }: { email?: string; password?: string } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "All fields are required");
    }

    const admin = await User.findOne({ email }) as IUser | null;

    if (!admin) {
        throw new ApiError(404, "User doesn't exist");
    }

    const isPasswordValid = await admin.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Incorrect admin credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(admin._id!.toString());

    const loggedInAdmin = await User.findById(admin._id).select("-password -refreshToken -rating -contestsParticipated -solvedProblems");

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    };

    res
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(
                200,
                { user: loggedInAdmin, accessToken, refreshToken },
                "Admin logged in successfully"
            )
        );
});

const getAdminInfo = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const adminId = req.user?._id;

  if (!adminId) {
    throw new ApiError(400, "Admin ID is required");
  }

  // Use aggregation to fetch admin info and populate contestsCreated
  const adminInfo = await User.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(adminId as mongoose.Types.ObjectId) }, 
    },
    {
      $lookup: {
        from: "contests",
        localField: "contestsCreated.contestId",
        foreignField: "_id", 
        as: "contestsCreated", 
      },
    },
    {
      $project: {
        password: 0, 
        refreshToken: 0,
        rating: 0,
        contestsParticipated: 0,
        solvedProblems: 0,
      },
    },
  ]);

  if (!adminInfo || adminInfo.length === 0) {
    throw new ApiError(404, "Admin not found");
  }

  res.status(200).json(new ApiResponse(200, adminInfo[0], "Admin info fetched successfully"));
});

export { registerAdmin, loginAdmin, getAdminInfo };
