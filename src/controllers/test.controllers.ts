import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const test = asyncHandler((req: Request, res: Response) => {
    res.status(200).json(new ApiResponse(200, {}, "Working"));
});

export { test };
