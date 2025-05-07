import { FilterQuery } from 'mongoose';
import Author from '../models/author.model';
import { CreateAuthorBody } from '../interfaces/request';
import { AppError, ErrNotFound } from '../config/error';
import { IAuthor } from '../interfaces/common';

class AuthorService {
  async getByIds(authorIds: string[]): Promise<IAuthor[]> {
    const foundAuthors = await Author.find({ name: { $in: authorIds } });

    if (foundAuthors.length === 0) {
      throw AppError.from(new Error('Không có tác giả nào tồn tại'), 400).withMessage(
        'Tạo sách không thành công: không có tác giả nào'
      );
    }

    return foundAuthors;
  }

  async getAllAuthors(cond: FilterQuery<IAuthor>, page: number, pageSize: number) {
    const totalAuthors = await Author.countDocuments(cond);
    const authors = await Author.find(cond)
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    return {
      authors,
      totalAuthors,
      totalPages: Math.ceil(totalAuthors / pageSize)
    };
  }

  async getAuthorById(authorId: string) {
    const author = await Author.findById(authorId);
    if (!author) {
      throw AppError.from(new Error('Author not found'), 404).withMessage('Tác giả không tồn tại');
    }
    return author;
  }

  async createAuthor(data: CreateAuthorBody, filePath?: string) {
    const { name, dob } = data;
    const existingAuthor = await Author.findOne({ name });

    if (existingAuthor) {
      throw AppError.from(new Error('Author already exists'), 400).withMessage('Tác giả đã tồn tại');
    }

    const newAuthor = new Author({
      ...data,
      imgSrc: filePath || ''
    });

    await newAuthor.save();
    return newAuthor;
  }

  async createAuthors(authorsData: any[]) {
    const authorNames = [...new Set(authorsData.flatMap((author) => author.name))];
    let foundAuthors = await Author.find({ name: { $in: authorNames } });

    const authorMap = new Map(foundAuthors.map((author) => [author.name, author._id]));
    const defaultAuthor =
      (await Author.findOne({ name: 'Nguyễn Văn A' })) || (await Author.create({ name: 'Nguyễn Văn A' }));

    const authorsToInsert = authorsData.map((author) => ({
      ...author,
      _id: authorMap.get(author.name) || defaultAuthor._id
    }));

    return await Author.insertMany(authorsToInsert);
  }

  async updateAuthor(
    authorId: string,
    updateData: CreateAuthorBody,
    file: Express.Multer.File | undefined
  ): Promise<any> {
    try {
      const existingAuthor = await Author.findById(authorId);
      if (!existingAuthor) {
        throw ErrNotFound.withMessage('Tác giả không tồn tại.').withDetail('authorId', authorId);
      }

      Object.assign(existingAuthor, updateData);

      if (file?.path) {
        existingAuthor.imgSrc = file.path;
      }

      const updatedAuthor = await existingAuthor.save();
      return updatedAuthor;
    } catch (error) {
      throw error;
    }
  }

  async deleteAuthor(authorId: string): Promise<void> {
    try {
      const deletedAuthor = await Author.findByIdAndDelete(authorId);
      if (!deletedAuthor) {
        throw ErrNotFound.withMessage('Tác giả không tồn tại.').withDetail('authorId', authorId);
      }
    } catch (error) {
      throw error;
    }
  }
}

export const authorService = new AuthorService();
