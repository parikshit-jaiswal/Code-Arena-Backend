import { Request, Response } from "express";
import axios from "axios";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const test = asyncHandler(async (req: Request, res: Response) => {
    try {
        const response = await axios.post(
            'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true',
            {
                source_code: `
# Python test code to print squares of numbers from 1 to 10
for i in range(1, 11):
    print(f"{i}^2 = {i**2}")
                `,
                language_id: 71, // Python 3
            },
            {
                headers: {
                    'content-type': 'application/json',
                    'X-RapidAPI-Key': `${process.env.RAPID_API_KEY}`,
                    'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
                }
            }
        );

        res.status(200).json(new ApiResponse(200, response.data, "Code executed successfully"));
    } catch (error: any) {
        console.error(error.response?.data || error.message);
        res.status(500).json(new ApiResponse(500, null, "Code execution failed"));
    }
});

export { test };
