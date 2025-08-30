import express from "express";
import {protectRoute} from "../middlewares/auth.js"
import { getMessagesFromUser, getUsersForSidebar, markMessageAsSeen, sendMessage } from "../controllers/messagecontroller.js";
const messageRouter=express.Router();

messageRouter.get("/users",protectRoute,getUsersForSidebar)
messageRouter.get("/:id",protectRoute,getMessagesFromUser)
messageRouter.put("/mark/:id",protectRoute,markMessageAsSeen);
messageRouter.post("/send/:id",protectRoute,sendMessage);
export default messageRouter;