import { Router } from "express";
import { addUser, getUser, getUsers, removeUser, modifyUser } from "../controllers/user.controller.js";


const userRouter = Router();

userRouter.get('/users', getUsers);
userRouter.get('/users/:id', getUser);
userRouter.post('/users', addUser);
userRouter.delete('/users/:id', removeUser);
userRouter.put('/users/:id', modifyUser);
// TODO: userRouter.put for updating a user (extra)

export { userRouter };