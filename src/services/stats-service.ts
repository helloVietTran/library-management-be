import moment from 'moment';
import BorrowRecord from '../models/borrow-record.model';
import { MonthlyBorrowedBookCountBody, StatsBorrowedAndReturnedBooksBody, TimeBasedStatsBody } from '../interfaces/response';

class StatsService {
  async countBorrowedAndReturnedBooksLastMonth(): Promise<StatsBorrowedAndReturnedBooksBody> {
    const currentDate = moment();
    const stats: {
      [key: string]: {
        borrowedBooksCount: number;
        returnedBooksCount: number;
      };
    } = {};

    for (let i = 4; i > -1; i--) {
      const month = currentDate.clone().subtract(i, 'months');
      const startOfMonth = month.clone().startOf('month').toDate();
      const endOfMonth = month.clone().endOf('month').toDate();
      const monthKey = month.format('YYYY-MM');

      const borrowedBooksCount = await BorrowRecord.countDocuments({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      });

      const returnedBooksCount = await BorrowRecord.countDocuments({
        returnDate: { $gte: startOfMonth, $lte: endOfMonth }
      });

      stats[monthKey] = { borrowedBooksCount, returnedBooksCount };
    }

    return stats;
  }

  async getMonthlyBorrowedBooksCounts(): Promise<MonthlyBorrowedBookCountBody> {
    const numberOfMonths = 6;
    const monthlyCounts: { [key: string]: number } = {};
    const currentDate = moment();

    for (let i = 0; i < numberOfMonths; i++) {
      const month = currentDate.clone().subtract(i, 'months');
      const startOfMonth = month.clone().startOf('month').toDate();
      const endOfMonth = month.clone().endOf('month').toDate();
      const monthKey = month.format('YYYY-MM');

      const borrowCount = await BorrowRecord.countDocuments({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      });

      monthlyCounts[monthKey] = borrowCount;
    }

    return Object.entries(monthlyCounts)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .reduce((obj: any, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {});
  }

  async getBorrowRecordsCountThisAndLastMonth(): Promise<TimeBasedStatsBody> {
    const now = moment().utc();
    const currentMonthEnd = now.clone().endOf('month').toDate();
    const previousMonthEnd = now.clone().subtract(1, 'months').endOf('month').toDate();

    const borrowsCurrentMonth = await BorrowRecord.countDocuments({
      createdAt: { $lte: currentMonthEnd }
    });

    const borrowsPreviousMonth = await BorrowRecord.countDocuments({
      createdAt: { $lte: previousMonthEnd }
    });

    return {
      currentMonth: borrowsCurrentMonth,
      previousMonth: borrowsPreviousMonth
    };
  }
}

export const statsService = new StatsService();
