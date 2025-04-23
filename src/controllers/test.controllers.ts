import { Request, Response } from "express";
import axios from "axios";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const test = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    res.status(200).json(new ApiResponse(200, { message: "Test route is working" }, "Test route is working"));
});

export { test };
