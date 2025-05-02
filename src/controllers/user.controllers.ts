import { Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { IUser } from "../types/user.types.js";
import User from "../models/user.model.js";
import { generateAccessAndRefreshTokens } from "../utils/tools.js";
import jwt from "jsonwebtoken";
import { sendOtpEmail } from "../utils/sendMail.js";
import mongoose from "mongoose";

const otpStore = new Map<
  string,
  {
    user: {
      username: string;
      email: string;
      password: string;
      verified?: boolean;
    };
    otp: string;
    expiry: number;
    otpVerified?: boolean;
  }
>();

const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    throw new ApiError(
      400,
      "All fields (username, email, and password) are required."
    );
  }

  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    throw new ApiError(
      409,
      "A user with this email or username already exists."
    );
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes

  otpStore.set(email, {
    user: { username, email, password },
    otp,
    expiry,
  });

  try {
    await sendOtpEmail(email, otp);
  } catch (error) {
    otpStore.delete(email);
    console.error("Error sending OTP email:", error);
    throw new ApiError(
      500,
      "Failed to send OTP email. Please try again later."
    );
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        "OTP sent successfully. Please check your email."
      )
    );
});

const verifyLoginOTP = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new ApiError(400, "Both email and OTP are required.");
  }

  const stored = otpStore.get(email);

  if (!stored) {
    throw new ApiError(
      400,
      "No OTP found for this email. Please request a new OTP."
    );
  }

  if (Date.now() > stored.expiry) {
    otpStore.delete(email);
    throw new ApiError(400, "The OTP has expired. Please request a new OTP.");
  }

  if (stored.otp !== otp) {
    throw new ApiError(401, "Invalid OTP. Please try again.");
  }

  const { username, password } = stored.user;

  try {
    const newUser = await User.create({ username, email, password });
    otpStore.delete(email);

    const user = await User.findById(newUser._id).select(
      "-password -refreshToken -contestsCreated"
    );

    res
      .status(201)
      .json(new ApiResponse(201, user, "User registered successfully."));
  } catch (error) {
    console.error("Error creating user:", error);
    throw new ApiError(
      500,
      "An error occurred while registering the user. Please try again."
    );
  }
});

const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password }: { email: string; password: string } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Both email and password are required.");
  }

  const user = (await User.findOne({ email })) as IUser | null;

  if (!user) {
    throw new ApiError(404, "No user found with this email.");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Incorrect password. Please try again.");
  }

  try {
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id!.toString()
    );

    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken -contestsCreated"
    );

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
          { user: loggedInUser, accessToken, refreshToken },
          "User logged in successfully."
        )
      );
  } catch (error) {
    console.error("Error during login:", error);
    throw new ApiError(
      500,
      "An error occurred during login. Please try again."
    );
  }
});

const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  await User.findByIdAndUpdate(
    (req as any).user._id,
    { $set: { refreshToken: undefined } },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

interface DecodedToken {
  _id: string;
  iat: number;
  exp: number;
}

const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }
  console.log("entered");
  try {
    console.log("first");
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET!
    ) as DecodedToken;

    const user = (await User.findById(decodedToken._id)) as IUser | null;
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id!.toString());

    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error: any) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Old and new passwords are required");
  }

  const user = (await User.findById((req as any).user._id)) as IUser | null;
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordValid) {
    throw new ApiError(401, "Incorrect password");
  }

  user.password = newPassword;
  await user.save();

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const forgetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required.");
  }

  const user = (await User.findOne({ email })) as IUser | null;

  if (!user) {
    throw new ApiError(404, "No user found with this email.");
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes

  otpStore.set(email, {
    user: {
      username: user.username,
      email: user.email,
      password: user.password,
    },
    otp,
    expiry,
  });

  try {
    await sendOtpEmail(email, otp);
  } catch (error) {
    otpStore.delete(email);
    console.error("Error sending OTP email:", error);
    throw new ApiError(
      500,
      "Failed to send OTP email. Please try again later."
    );
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        "OTP sent successfully. Please check your email."
      )
    );
});

const verifyResetPasswordOTP = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
      throw new ApiError(400, "Email and OTP are required");
    }

    const stored = otpStore.get(email);

    if (!stored) {
      throw new ApiError(400, "No OTP found for this email");
    }

    if (Date.now() > stored.expiry) {
      otpStore.delete(email);
      throw new ApiError(400, "OTP expired");
    }

    if (stored.otp !== otp) {
      throw new ApiError(401, "Invalid OTP");
    }

    otpStore.set(email, { ...stored, otpVerified: true });

    res.status(200).json(new ApiResponse(200, {}, "OTP verified successfully"));
  }
);

const updatePassword = asyncHandler(async (req: Request, res: Response) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    throw new ApiError(400, "Email and new password are required");
  }

  const stored = otpStore.get(email);

  if (!stored || !stored.otpVerified) {
    throw new ApiError(
      400,
      "OTP verification is required before updating the password"
    );
  }

  const user = (await User.findOne({ email })) as IUser | null;
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.password === newPassword) {
    throw new ApiError(
      400,
      "New password cannot be the same as the old password"
    );
  }

  user.password = newPassword;
  await user.save();
  otpStore.delete(email);

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Password updated successfully"));
});

const getUserData = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user._id;

  const user = await User.aggregate([
    {
      $match: {
        _id: userId,
      },
    },
    {
      $lookup: {
        from: "contests", // The name of the Contest collection
        localField: "contestsParticipated", // Reference the nested contestId field
        foreignField: "_id", // Match with the _id field in the Contest collection
        as: "contestsParticipated", // Output field for the joined data
      },
    },
    {
      $addFields: {
        totalScore: {
          $sum: "$contestsParticipated.score", // Sum up the scores from all contests
        },
        totalAttempts: {
          $sum: "$contestsParticipated.attempts", // Sum up the attempts from all contests
        },
        bestSubmissionTime: {
          $min: "$contestsParticipated.bestSubmissionTime", // Find the minimum submission time
        },
      },
    },
    {
      $project: {
        password: 0, // Exclude sensitive fields
        refreshToken: 0,
      },
    },
  ]);

  if (!user || user.length === 0) {
    throw new ApiError(404, "User not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, user[0], "User data retrieved successfully"));
});

export {
  registerUser,
  loginUser,
  verifyLoginOTP,
  logoutUser,
  refreshAccessToken,
  changePassword,
  forgetPassword,
  verifyResetPasswordOTP,
  updatePassword,
  getUserData,
};
