import { Router, type IRouter } from "express";
import healthRouter from "./health";
import cbseRouter from "./cbse";
import openaiRouter from "./openai";

const router: IRouter = Router();

router.use(healthRouter);
router.use(cbseRouter);
router.use(openaiRouter);

export default router;
