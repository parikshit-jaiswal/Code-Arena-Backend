import { Router } from "express";
import { test } from "../controllers/test.controllers.js";
import { getLanguages } from "../controllers/code.controllers.js";

const router: Router = Router();

router.route("/").get(test);

export default router;
