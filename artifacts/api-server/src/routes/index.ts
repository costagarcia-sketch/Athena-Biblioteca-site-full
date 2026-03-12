import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import booksRouter from "./books";
import usersRouter from "./users";
import loansRouter from "./loans";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(booksRouter);
router.use(usersRouter);
router.use(loansRouter);

export default router;
