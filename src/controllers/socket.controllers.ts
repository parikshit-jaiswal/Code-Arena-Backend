import { io } from "../app.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Room from "../models/room.model.js";
import Problem from "../models/problem.model.js";
import mongoose from "mongoose";
import { evaluateSolution } from "../utils/evaluateSolution";

const SUPPORTED_LANGUAGES = ["cpp", "python", "javascript", "c", "java"];

io.use(async (socket, next) => {
  try {
    
    const token =
      socket.handshake.headers.cookie
        ?.split("; ")
        .find((c) => c.startsWith("accessToken="))
        ?.split("=")[1] ||
      socket.handshake.auth?.token ||
      socket.handshake.headers["authorization"]?.replace("Bearer ", "");

    if (!token) {
      return next(new Error("Unauthorized: No token provided"));
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);
    const user = await User.findById((decoded as any)._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      return next(new Error("Unauthorized: Invalid token"));
    }

    socket.data.userId = (
      user as { _id: mongoose.Types.ObjectId }
    )._id.toString();
    socket.data.user = user;
    next();
  } catch (err) {
    next(new Error("Unauthorized: Invalid token"));
  }
});

io.on("connection", async (socket) => {
  const userId = socket.data.userId;
  const user = socket.data.user;
  if (!userId || !user) {
    return socket.disconnect(true);
  }

  socket.on("createRoom", async (callback) => {
    try {
      const problem = await Problem.aggregate([{ $sample: { size: 1 } }]);
      if (!problem.length) {
        return callback({ success: false, message: "No problems available" });
      }
      const roomId = new mongoose.Types.ObjectId().toString();
      const room = await Room.create({
        roomId,
        problemId: problem[0]._id,
        users: [{
          userId,
          username: user.username,
          score: 0,
          submissionStatus: "pending",
          rating: user.rating || 1200,
          isCreator: true, // Mark creator
        }],
        isActive: true,
        roomStatus: "waiting",
      });
      socket.join(roomId);
      callback({ success: true, roomId, problemId: problem[0]._id, users: room.users });
    } catch (err) {
      callback({ success: false, message: "Failed to create room" });
    }
  });

  socket.on("joinCodingRoom", async ({ roomId }, callback) => {
    try {
      let room;
      if (roomId) {
        room = await Room.findOne({ roomId, isActive: true });
        if (!room) {
          return callback({ success: false, message: "Room not found" });
        }
      } else {
        const userRating = user.rating || 1000;
        room = await Room.findOne({
          isActive: true,
          roomStatus: "waiting",
          $expr: { $lt: [{ $size: "$users" }, 10] },
          "users.0": { $exists: true },
          "users": {
            $elemMatch: {
              rating: { $gte: userRating - 200, $lte: userRating + 200 }
            }
          }
        });
        if (!room) {
          return callback({ success: false, message: "No suitable rooms found" });
        }
      }

      if (!room.users.some((u: any) => u.userId.toString() === userId)) {
        room.users.push({
          userId,
          username: user.username,
          score: 0,
          submissionStatus: "pending",
          rating: user.rating || 1200,
          isCreator: false,
        });
        await room.save();
      }

      socket.join(room.roomId);

      callback({
        success: true,
        roomId: room.roomId,
        problemId: room.problemId,
        users: room.users,
      });
      io.to(room.roomId).emit("roomUpdate", { users: room.users });

      // REMOVE auto-start logic here!
      // if (room.users.length >= 2 && room.roomStatus === "waiting") { ... }
    } catch (err) {
      callback({ success: false, message: "An error occurred joining the room" });
    }
  });

  // New event: Only creator can start the match
  socket.on("startMatch", async ({ roomId }, callback) => {
    try {
      const room = await Room.findOne({ roomId, isActive: true });
      if (!room) return callback({ success: false, message: "Room not found" });

      const creator = room.users.find((u: any) => u.isCreator && u.userId.toString() === userId);
      if (!creator) return callback({ success: false, message: "Only the creator can start the match" });

      if (room.roomStatus !== "waiting") {
        return callback({ success: false, message: "Match already started or finished" });
      }

      room.roomStatus = "Live";
      await room.save();

      io.to(room.roomId).emit("matchStart", {
        message: "Match started",
        users: room.users,
        problemId: room.problemId,
      });

      callback({ success: true });
    } catch (err) {
      callback({ success: false, message: "Failed to start match" });
    }
  });

  socket.on("submitSolution", async ({ roomId, code, language }, callback) => {
    try {
      const room = await Room.findOne({ roomId });
      if (!room) return callback({ success: false, message: "Room not found" });

      const user = room.users.find((u: any) => u.userId.toString() === userId);
      if (!user)
        return callback({ success: false, message: "User not in room" });

      // Validate language
      if (!SUPPORTED_LANGUAGES.includes(language)) {
        return callback({ success: false, message: "Unsupported language" });
      }

      const { score, passedTestcases } = await evaluateSolution(
        room.problemId.toString(),
        code,
        language
      );

      user.score = score;
      user.submissionStatus = "submitted";
      user.submissionTime = new Date();

      await room.save();

      io.to(room.roomId).emit("scoreUpdate", { users: room.users });
      io.to(room.roomId).emit("submissionUpdate", {
        userId,
        submissionStatus: "submitted",
        score,
        passedTestcases,
      });
      const allSubmitted = room.users.every(
        (u: any) => u.submissionStatus === "submitted"
      );
      if (allSubmitted) {
        (room as any).roomStatus = "finished";
        await room.save();
        io.to(room.roomId).emit("matchFinished", {
          message: "Match completed",
          users: room.users,
        });
      }

      callback({ success: true, score, passedTestcases });
    } catch (err) {
      console.error("submitSolution error:", err);
      callback({ success: false, message: "Failed to evaluate solution" });
    }
  });

  socket.on("leaveRoom", async (roomId) => {
    try {
      socket.leave(roomId);

      const room = await Room.findOne({ roomId });
      if (!room) return;

      room.users.pull({ userId: new mongoose.Types.ObjectId(userId) });

      if (room.users.length === 0) {
        room.isActive = false;
        (room as any).roomStatus = "finished";
      }

      await room.save();

      io.to(roomId).emit("roomUpdate", { users: room.users });
    } catch (err) {
      console.error("leaveRoom error:", err);
    }
  });

  socket.on("disconnect", async () => {
    try {
      const rooms = await Room.find({ "users.userId": userId, isActive: true });

      for (const room of rooms) {
        room.users.pull({ userId: new mongoose.Types.ObjectId(userId) });

        if (room.users.length === 0) {
          room.isActive = false;
          (room as any).roomStatus = "finished";
        }

        await room.save();
        io.to(room.roomId).emit("roomUpdate", { users: room.users });
      }
    } catch (err) {
      console.error("disconnect cleanup error:", err);
    }
  });
});

export default io;
