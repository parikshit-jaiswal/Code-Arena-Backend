import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import User from "../models/user.model";
import { IUser } from "../types/user.types";

interface DecodedToken {
  _id: string;
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: Omit<IUser, "password" | "refreshToken">;
    }
  }
}

export const verifyJWT = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("Cookies:", req.cookies);
      console.log("Auth Header:", req.header("Authorization"));

      const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");
      console.log("Token:", token);

      if (!token) {
        throw new ApiError(401, "Unauthorized request");
      }

      let decodedToken: DecodedToken;

      try {
        // Verify the access token
        decodedToken = jwt.verify(
          token,
          process.env.ACCESS_TOKEN_SECRET as string
        ) as DecodedToken;
      } catch (error: any) {
        if (error.name === "TokenExpiredError") {
          throw new ApiError(401, "Access token expired. Please refresh your token.");
        }
        throw new ApiError(401, "Invalid access token");
      }

      const user = await User.findById(decodedToken._id).select(
        "-password -refreshToken"
      );
      console.log("User:", user);

      if (!user) {
        throw new ApiError(401, "Invalid Access Token");
      }

      req.user = user;
      next();
    } catch (error: any) {
      throw new ApiError(401, error?.message || "Invalid access token");
    }
  }
);
