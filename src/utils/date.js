const startOfWeekMondayUTC = (date) => {
    const d = new Date(Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate()
    ));
    const day = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() - (day - 1));
    return d;
}

const endOfWeekSundayUTC = (date) => {
    const monday = startOfWeekMondayUTC(date);
    const sunday = new Date(monday.getTime());
    sunday.setUTCDate(sunday.getUTCDate() + 6);
    return sunday;
}

const toISODateUTC = (date) => {
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, "0");
    const d = String(date.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

const addDaysUTC = (date, days) => {
  const copy = new Date(date.getTime());
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

export default {
    startOfWeekMondayUTC,
    endOfWeekSundayUTC,
    toISODateUTC,
    addDaysUTC,
};