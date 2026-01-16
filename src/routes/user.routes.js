import { Router } from "express";
import { addUser, getUser, getUsers, removeUser, modifyUser } from "../controllers/user.controller.js";
import { validateCreateUser } from "../middlewares/user.middleware.js";
import { httpMetricsMiddleware } from "../middlewares/prometheus.middleware.js";


const userRouter = Router();

userRouter.get('/users', httpMetricsMiddleware, getUsers);
userRouter.get('/users/:id', httpMetricsMiddleware, getUser);
userRouter.post('/users', httpMetricsMiddleware, validateCreateUser, addUser);
userRouter.delete('/users/:id', httpMetricsMiddleware, removeUser);
// E0 
userRouter.put('/users/:id', httpMetricsMiddleware, modifyUser);


export { userRouter };