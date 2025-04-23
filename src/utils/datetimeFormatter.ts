import moment from "moment";
import "moment/locale/vi"; 

moment.locale("vi");

const dateFormatter = (createdAt: string | Date): string => {
  const date = moment(createdAt);

  if (!date.isValid()) {
    return "Ngày không hợp lệ";
  }

  const now = moment();
  const diffYears = now.diff(date, "years");

  if (diffYears >= 1) {
    return date.format("DD/MM/YYYY");
  }
  return date.fromNow();
};

export default dateFormatter;
