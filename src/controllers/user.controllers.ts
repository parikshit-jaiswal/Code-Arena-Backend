import { Request, Response } from "express";
import User from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { IUser } from "../types/user.types";
import jwt from "jsonwebtoken";

interface DecodedToken {
  _id: string;
  iat: number;
  exp: number;
}

const generateAccessAndRefreshTokens = async (userId: string) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error generating tokens:", error);
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh tokens"
    );
  }
};

const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const {
    username,
    email,
    password,
  }: { username?: string; email?: string; password?: string } = req.body;

  if (!username || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  const user = await User.create({
    username,
    email,
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { email, password }: { email?: string; password?: string } = req.body;

    if (!email || !password) {
      throw new ApiError(400, "All fields are required");
    }

    const user = (await User.findOne({ email })) as IUser | null;

    if (!user) {
      throw new ApiError(404, "User doesn't exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
      throw new ApiError(401, "Incorrect user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id!.toString()
    );

    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
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
          { user: loggedInUser },
          "User logged in successfully"
        )
      );
  }
);

const logoutUser = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id;
    console.log("REQ", req);

    if (!userId) {
      throw new ApiError(401, "Unauthorized: User not found in request");
    }

    await User.findByIdAndUpdate(userId, {
      $unset: { refreshToken: 1 },
    });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "development",
      sameSite: "strict" as const,
    };

    res
      .status(200)
      .clearCookie("accessToken", cookieOptions)
      .clearCookie("refreshToken", cookieOptions)
      .json(new ApiResponse(200, {}, "User logged out successfully"));
  }
);

const refreshToken = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { refreshToken }: { refreshToken?: string } = req.cookies;

    if (!refreshToken) {
      throw new ApiError(401, "Refresh token not provided");
    }

    try {
      const decodedToken = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET as string
      ) as DecodedToken;

      const user = await User.findById(decodedToken._id);

      if (!user || user.refreshToken !== refreshToken) {
        throw new ApiError(401, "Invalid refresh token");
      }

      const newAccessToken = user.generateAccessToken();
      const newRefreshToken = user.generateRefreshToken();

      user.refreshToken = newRefreshToken;
      await user.save({ validateBeforeSave: false });

      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict" as const,
      };

      res
        .cookie("accessToken", newAccessToken, cookieOptions)
        .cookie("refreshToken", newRefreshToken, cookieOptions)
        .json(
          new ApiResponse(
            200,
            { accessToken: newAccessToken },
            "Token refreshed successfully"
          )
        );
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        throw new ApiError(
          401,
          "Refresh token has expired. Please log in again."
        );
      }
      throw new ApiError(401, error?.message || "Invalid refresh token");
    }
  }
);

const forgetPassword = asyncHandler(async(req: Request, res: Response) => {
    //TODO
    //1. get the user via token
    //2. check if the token is valid or not
    //3. if valid update and save the password
    //4. send the response
    //5. send the email with the new password


})

export { registerUser, loginUser, logoutUser, refreshToken };
