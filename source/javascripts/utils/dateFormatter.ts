const formatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

function getFormattedDate(date: Date): string {
  return formatter.format(date);
}

export default { getFormattedDate };
