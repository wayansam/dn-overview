// Bump when TaskStore changes shape, and migrate in loadTaskStore.
export const TASK_STORE_VERSION = 1;

// Most tasks a task table (e.g. Weekly Account) can hold.
export const TASK_LIMIT = 20;

// The game server runs on Singapore time (UTC+8, no daylight saving). Task
// dates and the Server Time clock follow it.
export const SERVER_TIME_ZONE = "Asia/Singapore";
export const SERVER_UTC_OFFSET_HOURS = 8;

// Weekly tasks reset every Saturday (day 6) at 09:00 server time.
export const WEEKLY_RESET_DAY = 6;
export const WEEKLY_RESET_HOUR = 9;
