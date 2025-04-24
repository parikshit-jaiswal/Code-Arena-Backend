import { Request, Response } from "express";
import axios from "axios";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sendOtpEmail } from "../utils/sendMail.js";

const test = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email }: { email: string } = { email: "parikshitjaiswal82@gmail.com" };

    const otp: number = Math.floor(100000 + Math.random() * 900000);
    await sendOtpEmail(email, otp.toString());
    res.status(200).json(new ApiResponse(200, { message: "Test route is working", otp }, "Test route is working"));
});

export { test };
