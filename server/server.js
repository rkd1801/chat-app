import express from "express";
import "dotenv/config";
import cors from 'cors';
import http from 'http';
import { connectDB } from "./lib/db.js";
import router from "./routes/user.js";
import messageRouter from "./routes/messageroutes.js";
import { Server } from "socket.io";
const app=express();
const server=http.createServer(app);
// Initialize socket.io server

export const io= new Server(server,{
    cors:{origin:"*"}
})
// Store online Users
export const userSocketMap={};//{userId:socketId}
io.on("connection",(socket)=>{
    const userId=socket.handshake.query.userId;
    console.log("User Connected",userId);

    if(userId)userSocketMap[userId]=socket.id;

    //Emit online users to all connected clients
    io.emit("getOnlineUsers",Object.keys(userSocketMap));
    socket.on("disconnect",()=>{
        console.log("User Disconnected",userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers",Object.keys(userSocketMap))
    })
})
app.use(express.json({limit:"4mb"}));
app.use(cors());

app.use("/api/status",(req,res)=>{
   return  res.send("Server is live");
})

app.use("/api/auth",router);
app.use("/api/messages",messageRouter);
await connectDB();
const PORT= process.env.PORT || 8000;
server.listen(PORT,()=>{
    return console.log("Server is running on port:"+ PORT);
})