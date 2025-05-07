import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import Comment from '../models/comment.model';
import Book from '../models/book.model';
import { CreateCommentBody } from '../interfaces/request';
import { AppError } from '../config/error';
import { successResponse } from '../utils/utils';

class CommentController {
  async getCommentsByBookId(
    req: Request<{ bookId: string }, {}, {}, { sortBy?: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { bookId } = req.params;
      const { sortBy } = req.query;

      const sortDirection = sortBy === '1' ? 1 : -1;

      const comments = await Comment.find({ book: bookId })
        .populate('user', 'fullName _id')
        .select('-book')
        .sort({ createdAt: sortDirection })
        .exec();

      res.status(200).json(successResponse('success', comments));
    } catch (error) {
      next(error);
    }
  }

  async countCommentsByRating(req: Request<{ bookId: string }>, res: Response, next: NextFunction) {
    try {
      const { bookId } = req.params;
      const result = await Comment.aggregate([
        {
          $match: { book: new mongoose.Types.ObjectId(bookId) }
        },
        {
          $group: {
            _id: '$rating',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
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
        averageRating: averageRating.toFixed(1)
      });
    } catch (error) {
      next(error);
    }
  }

  async getCommentsByUserId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;

      const comments = await Comment.find({ user: userId }).populate('user', 'fullName email').sort({ createdAt: -1 });

      res.status(200).json(successResponse('Lấy tất cả bình luận của người dùng thành công', comments));
    } catch (error) {
      next(error);
    }
  }

  async createComment(req: Request<{}, {}, CreateCommentBody>, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = res.locals.requester.sub;
      const { content, bookId, rating } = req.body;

      const foundBook = await Book.findById(bookId);
      if (!foundBook)
        throw AppError.from(new Error('Sách không tồn tại'), 404)
          .withDetail('bookId', bookId)
          .withLog(`Book not found with id=${bookId}`);

      const newComment = new Comment({
        content,
        user: userId,
        book: bookId,
        rating
      });

      await newComment.save();

      res.status(201).json({
        success: true,
        message: 'Bình luận đã được thêm.',
        comment: newComment
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { commentId } = req.params;

      const deletedComment = await Comment.findByIdAndDelete(commentId);
      if (!deletedComment)
        throw AppError.from(new Error('Bình luận không tồn tại.'), 404).withDetail('commentId', commentId);

      res.status(200).json({ success: true, message: 'Bình luận đã được xóa.' });
    } catch (error) {
      next(error);
    }
  }

  async likeComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { commentId } = req.params;

      const comment = await Comment.findById(commentId);
      if (!comment) throw AppError.from(new Error('Bình luận không tồn tại.'), 404).withDetail('commentId', commentId);

      comment.likes += 1;
      await comment.save();

      res.status(200).json(successResponse('Like thành công!', comment));
    } catch (error) {
      next(error);
    }
  }
}

export default new CommentController();
