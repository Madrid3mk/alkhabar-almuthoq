import { Router, type IRouter } from "express";
import healthRouter from "./health";
import newsRouter from "./news";
import sourcesRouter from "./sources";
import usersRouter from "./users";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(newsRouter);
router.use(sourcesRouter);
router.use(usersRouter);
router.use(dashboardRouter);

export default router;
