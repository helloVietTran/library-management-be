import { FilterQuery, ObjectId } from 'mongoose';
import Book from '../models/book.model';
import { IBook } from '../interfaces/common';
import { AppError } from '../config/error';
import { UpdateBookBody } from '../interfaces/request';

class BookService {
  async existsByCond(cond: FilterQuery<IBook>): Promise<boolean> {
    const result = await Book.exists(cond);
    return !!result;
  }
  async findById(bookId: string | ObjectId): Promise<IBook> {
    const book = await Book.findById(bookId);
    if (!book) throw AppError.from(new Error('Book not found'), 404).withMessage('Không tìm thấy sách');
    return book;
  }

  async countByCond(cond: FilterQuery<IBook>) {
    return await Book.countDocuments(cond);
  }

  async findByCondAndPaginate(cond: FilterQuery<IBook>, page: number, pageSize: number) {
    return await Book.find(cond)
      .skip((page - 1) * pageSize)
      .limit(pageSize);
  }

  async deleteBook(bookId: string): Promise<void> {
    const deletedBook = await Book.findByIdAndDelete(bookId);
    
    if (!deletedBook) {
      throw AppError.from(new Error('Sách không tồn tại'), 404).withMessage(
        'Xóa sách không thành công: sách không tồn tại'
      );
    }
  }

  async updateBook(bookId: string, updateData: UpdateBookBody, avatarPath?: string): Promise<IBook> {
    const updatedFields = {
      ...updateData,
      ...(avatarPath && { coverImage: avatarPath })
    };

    const updatedBook = await Book.findByIdAndUpdate(bookId, updatedFields, {
      new: true, 
      runValidators: true 
    });

    if (!updatedBook) {
      throw AppError.from(new Error('Book not found'), 404).withMessage('Không tìm thấy sách');
    }

    return updatedBook;
  }

  async deleteManyBooks(bookIds: string[]): Promise<{ success: boolean; message: string }> {
    if (!Array.isArray(bookIds) || bookIds.length === 0) {
      throw AppError.from(new Error('Danh sách bookIds không hợp lệ'), 400).withMessage('Danh sách bookIds không hợp lệ');
    }

    const result = await Book.deleteMany({
      _id: { $in: bookIds }
    });

    if (result.deletedCount === 0) {
      throw AppError.from(new Error('Không tìm thấy sách nào để xóa'), 404).withMessage('Xóa sách không thành công');
    }

    return {
      success: true,
      message: `${result.deletedCount} sách đã được xóa thành công.`
    };
  }
}

export const bookService = new BookService();
