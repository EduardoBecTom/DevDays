import { Router } from "express";
import { addUser, getUser, getUsers, removeUser, modifyUser } from "../controllers/user.controller.js";


const userRouter = Router();

userRouter.get('/users', getUsers);
userRouter.get('/users/:id', getUser);
userRouter.post('/users', addUser);
userRouter.delete('/users/:id', removeUser);
// E0 
userRouter.put('/users/:id', modifyUser);


export { userRouter };