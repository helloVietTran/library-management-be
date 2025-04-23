import { Request, Response, NextFunction } from "express";

import { CreateCommentRequest } from "../types/request";
import Comment from "../models/Comment";
import Book from "../models/Book";

import AppError from "../error-handlers/AppError";
import mongoose from "mongoose";

class CommentController {
  // Lấy danh sách bình luận theo sách
  async getCommentsByBookId(
    req: Request<{ bookId: string }, {}, {}, { sortBy?: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { bookId } = req.params;
      const { sortBy } = req.query;

      // -1: giảm dần, 1: tăng dần
      const sortDirection = sortBy === "1" ? 1 : -1;

      const comments = await Comment.find({ book: bookId })
        .populate("user", "fullName _id")
        .select("-book") 
        .sort({ createdAt: sortDirection })
        .exec();

      res.status(200).json(comments);
    } catch (error) {
      next(error);
    }
  }

  async countCommentsByRating(req: Request, res: Response, next: NextFunction) {
    try {
      const { bookId } = req.params;
      const result = await Comment.aggregate([
        {
          $match: { book: new mongoose.Types.ObjectId(bookId) },
        },
        {
          $group: {
            _id: "$rating",
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);
  
      const counts: Record<number, number> = {};
      let total = 0;
      let weightedSum = 0;

      for (let i = 1; i <= 5; i++) {
        const found = result.find((r) => r._id === i);
        const count = found ? found.count : 0;
        counts[i] = count;
        
        total += count;
        weightedSum += i * count; 
      }
  
      const averageRating = total > 0 ? weightedSum / total : 0;
  
      res.status(200).json({
        totalComments: total,
        ratingsBreakdown: counts,
        averageRating: averageRating.toFixed(1), 
      });
    } catch (error) {
      next(error);
    }
  }
  

  async getCommentsByUserId(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId } = req.params;

      const comments = await Comment.find({ user: userId })
        .populate("user", "fullName email")
        .sort({ createdAt: -1 });

      res.status(200).json(comments);
    } catch (error) {
      next(error);
    }
  }

  // Thêm bình luận mới
  async createComment(
    req: CreateCommentRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { content, userId, bookId, rating } = req.body;

      const foundBook = await Book.findById(bookId);
      if (!foundBook)
        throw new AppError("Sách không tồn tại", 404, "/comments", "POST");

      const newComment = new Comment({
        content,
        user: userId,
        book: bookId,
        rating,
      });

      await newComment.save();

      res.status(201).json({
        success: true,
        message: "Bình luận đã được thêm.",
        comment: newComment,
      });
    } catch (error) {
      next(error);
    }
  }

  // Xóa bình luận
  async deleteComment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { commentId } = req.params;

      const deletedComment = await Comment.findByIdAndDelete(commentId);
      if (!deletedComment)
        throw new AppError(
          "Bình luận không tồn tại.",
          404,
          "/comments/:commentId",
          "DELETE"
        );

      res
        .status(200)
        .json({ success: true, message: "Bình luận đã được xóa." });
    } catch (error) {
      next(error);
    }
  }

  // Like một bình luận
  async likeComment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { commentId } = req.params;

      const comment = await Comment.findById(commentId);
      if (!comment)
        throw new AppError(
          "Bình luận không tồn tại.",
          404,
          "/comments/:commentId/like",
          "POST"
        );

      comment.likes += 1;
      await comment.save();

      res.status(200).json({
        success: true,
        message: "Bình luận đã được like.",
        likes: comment.likes,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CommentController();
