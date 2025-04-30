import { application, Request, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

dotenv.config();

const runCode = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const {
        code,
        language,
        testCases
    }: {
        code: string;
        language: string;
        testCases: { input: string; output: string }[];
    } = req.body;

    if (!code || !language || !testCases || !Array.isArray(testCases)) {
        return res.status(400).json(
            new ApiResponse(400, null, "Code, language, and testCases array are required")
        );
    }

    const CODE_EXEC_API_URL = process.env.CODE_EXEC_API_URL;
    if (!CODE_EXEC_API_URL) {
        return res.status(500).json(
            new ApiResponse(500, null, "Judge0 API URL is not configured")
        );
    }

    try {
        const response = await axios.post(
            JUDGE0_API_URL,
            { code, language, testCases },
            { headers: { "Content-Type": "application/json" } }
        );

        return res.status(200).json(
            new ApiResponse(200, response.data, "Code executed successfully")
        );
    } catch (error: any) {
        return res.status(500).json(
            new ApiResponse(
                500,
                null,
                error.response?.data?.message || "Failed to execute code"
            )
        );
    }
});



// const runCode = asyncHandler(async (req: Request, res: Response): Promise<any> => {
//     const {
//         code,
//         language,
//         testCases
//     }: {
//         code: string;
//         language: string;
//         testCases: { input: string; expectedOutput: string }[];
//     } = req.body;

//     if (!code || !language || !testCases || !Array.isArray(testCases)) {
//         return res.status(400).json(new ApiResponse(400, null, "Code, language, and testCases array are required"));
//     }

//     let languageId: number;

//     switch (language.toLowerCase()) {
//         case "python":
//             languageId = 71;
//             break;
//         case "javascript":
//             languageId = 63;
//             break;
//         case "java":
//             languageId = 62;
//             break;
//         case "c":
//             languageId = 50;
//             break;
//         case "cpp":
//         case "c++":
//             languageId = 54;
//             break;
//         default:
//             return res.status(400).json(new ApiResponse(400, null, "Unsupported language"));
//     }

//     const results = await Promise.all(
//         testCases.map(async ({ input, expectedOutput }, index) => {
//             try {
//                 const response = await axios.post(
//                     "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true",
//                     {
//                         source_code: code,
//                         language_id: languageId,
//                         stdin: input,
//                         cpu_time_limit: 2,
//                         memory_limit: 128000
//                     },
//                     {
//                         headers: {
//                             "content-type": "application/json",
//                             "X-RapidAPI-Key": process.env.RAPID_API_KEY!,
//                             "X-RapidAPI-Host": process.env.RAPID_API_HOST!
//                         }
//                     }
//                 );

//                 const actual = (response.data.stdout || "").trim();
//                 const expected = expectedOutput.trim();

//                 return {
//                     testCase: index + 1,
//                     input,
//                     expectedOutput: expected,
//                     actualOutput: actual,
//                     passed: actual === expected,
//                     stderr: response.data.stderr,
//                     status: response.data.status?.description,
//                     time: response.data.time,
//                     memory: response.data.memory
//                 };
//             } catch (error: any) {
//                 return {
//                     testCase: index + 1,
//                     input,
//                     expectedOutput,
//                     actualOutput: "",
//                     passed: false,
//                     error: error.response?.data || error.message
//                 };
//             }
//         })
//     );

//     const allPassed = results.every(r => r.passed);

//     return res.status(200).json(
//         new ApiResponse(200, {
//             allPassed,
//             results
//         }, allPassed ? "All test cases passed ✅" : "Some test cases failed ❌")
//     );
// });

// const getLanguages = asyncHandler(async (req: Request, res: Response): Promise<any> => {
//     try {
//         const response = await axios.get(
//             "https://judge0-ce.p.rapidapi.com/languages/all",
//             {
//                 headers: {
//                     "X-RapidAPI-Key": process.env.RAPID_API_KEY!,
//                     "X-RapidAPI-Host": process.env.RAPID_API_HOST!
//                 }
//             }
//         );

//         const languages = response.data.map((lang: { id: number; name: string }) => ({
//             id: lang.id,
//             name: lang.name
//         }));

//         return res.status(200).json(
//             new ApiResponse(200, { languages }, "Languages fetched successfully")
//         );
//     } catch (error: any) {
//         return res.status(500).json(
//             new ApiResponse(500, null, error.response?.data?.message || "Failed to fetch languages")
//         );
//     }
// });

export { runCode };
