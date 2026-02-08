type DateFormatOptions = {
  includeTime?: boolean;
};

// Output: "24. 01. 15." or with time "24. 01. 15. 오전 10:30"
export const formatPostDate = (
  dateString: string,
  options: DateFormatOptions = {},
): string => {
  const { includeTime = false } = options;
  const date = new Date(dateString);

  const formatOptions: Intl.DateTimeFormatOptions = {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    ...(includeTime && {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };

  return new Intl.DateTimeFormat('ko-KR', formatOptions).format(date);
};
