import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const submitSolution = asyncHandler(async (req: Request, res: Response) => {
    //TODO:
    // 1. Validate the user is participant or not 
    // 2. Validate that the user is a participant of the contest
    // 3. get the contest id from the params 
    // 4. get the problem id from the params
    // 5. get the problem solution information from the request body
    // 5.5. update the score of problem and the contest 
    // 6. update the solution id to the user's submitted problems
    // 6.5. update the problem id in the solution
    // 6.6. update the solution id in the problem
    // 7. show the success message

    const { contestId, problemId } = req.params;

    const { score, code, language, noOfTestCasesPassed, timeTakenPerProblem, timeTakenToExecute, memoryTaken, } = req.body;
    
})