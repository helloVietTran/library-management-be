import { Request, Response, NextFunction } from "express";

import AppError from "../error-handlers/AppError";
import Author, { IAuthor } from "../models/Author";
import { PaginatedBody } from "../types/response";
import {
  CreateAuthorRequest,
  PrimaryQuery,
  UpdateAuthorRequest,
} from "../types/request";

class AuthorController {
  // lấy danh sách tác giả có phân trang
  async getAuthors(
    req: Request<any, any, any, PrimaryQuery>,
    res: Response<PaginatedBody<IAuthor>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const search = (req.query.search as string)?.trim() || "";

      const searchFilter = search
        ? { name: { $regex: search, $options: "i" } }
        : {};

      const totalAuthors = await Author.countDocuments(searchFilter);
      const totalPages = Math.ceil(totalAuthors / pageSize);

      const authors = await Author.find(searchFilter)
        .skip((page - 1) * pageSize)
        .limit(pageSize);

      res.status(200).json({
        data: authors,
        currentPage: page,
        pageSize,
        totalPages,
        totalElement: totalAuthors,
      });
    } catch (error) {
      next(error);
    }
  }

  // lấy tác giả bằng authorId
  async getAuthorById(
    req: Request<{ authorId: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { authorId } = req.params;
      const author = await Author.findById(authorId);
      if (!author) {
        res
          .status(404)
          .json({ success: false, message: "Tác giả không tồn tại." });
        return;
      }
      res.status(200).json(author);
    } catch (error) {
      next(error);
    }
  }

  // tạo 1 tác giả
  async createAuthor(
    req: CreateAuthorRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { name, dob } = req.body;
      const existingAuthor = await Author.findOne({
        name: name,
        dob: dob,
      });

      if (existingAuthor) {
        throw new AppError("Tác giả đã tồn tại", 400, "/authors", "POST")
      }

      const newAuthor = new Author({
        ...req.body,
        imgSrc: req.file?.path || "",
      });

      await newAuthor.save();

      res.status(201).json({
        success: true,
        message: "Tác giả đã được tạo thành công.",
        author: newAuthor,
      });
    } catch (error) {
      next(error);
    }
  }

  // hàm tạo danh sách tác giả
  // chỉ dùng bởi admin
  async createAuthors(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const authors = await Author.insertMany(req.body);

      res.status(201).json({
        success: true,
        message: "Danh sách tác giả đã được tạo thành công.",
        authors,
      });
    } catch (error) {
      next(error);
    }
  }

  // update tác giả
  async updateAuthor(
    req: UpdateAuthorRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { authorId } = req.params;

      const existingAuthor = await Author.findById(authorId);
      if (!existingAuthor) {
        throw new AppError("Tác giả không tồn tại.", 404, "/authors", "GET");
      }

      Object.assign(existingAuthor, req.body);

      if (req.file?.path) {
        existingAuthor.imgSrc = req.file.path;
      }

      const updatedAuthor = await existingAuthor.save();

      res.status(200).json({
        success: true,
        message: "Tác giả đã được cập nhật thành công.",
        author: updatedAuthor,
      });
    } catch (error) {
      next(error);
    }
  }

  // xóa tác giả
  async deleteAuthor(
    req: Request<{ authorId: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { authorId } = req.params;
      const deletedAuthor = await Author.findByIdAndDelete(authorId);
      if (!deletedAuthor) {
        res
          .status(404)
          .json({ success: false, message: "Tác giả không tồn tại." });
        return;
      }
      res.status(200).json({
        success: true,
        message: "Tác giả đã được xóa thành công.",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthorController();
