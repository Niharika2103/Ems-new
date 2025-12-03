export const calculateDurationMonths = (start, end) => {
  if (!start || !end) return 0;

  const startDate = new Date(start);
  const endDate = new Date(end);

  let months =
    (endDate.getFullYear() - startDate.getFullYear()) * 12 +
    (endDate.getMonth() - startDate.getMonth());

  if (endDate.getDate() < startDate.getDate()) months--;

  return months;
};

export const calculateDaysLeft = (end) => {
  if (!end) return 0;

  const today = new Date();
  const endDate = new Date(end);

  const diff = endDate - today;
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  return days < 0 ? 0 : days;
};

export const formatDate = (dateStr) => {
  if (!dateStr) return "";

  const date = new Date(dateStr);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};
