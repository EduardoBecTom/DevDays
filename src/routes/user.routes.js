import { Router } from "express";
import { addUser, getUser, getUsers, removeUser, modifyUser } from "../controllers/user.controller.js";
import { validateCreateUser } from "../middlewares/user.middleware.js";


const userRouter = Router();

userRouter.get('/users', getUsers);
userRouter.get('/users/:id', getUser);
userRouter.post('/users', validateCreateUser, addUser);
userRouter.delete('/users/:id', removeUser);
// E0 
userRouter.put('/users/:id', modifyUser);


export { userRouter };