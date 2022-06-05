export const formatDate = () => {
  const currentDate = new Date();
  const options = {
    weekday: 'long' as const, year: 'numeric' as const, month: 'short' as const, day: 'numeric' as const,
  };
  return currentDate.toLocaleDateString('en-us', options);
};
