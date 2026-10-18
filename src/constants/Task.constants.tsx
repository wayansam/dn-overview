// Bump when TaskStore changes shape, and migrate in loadTaskStore.
export const TASK_STORE_VERSION = 1;

// Most tasks a task table (e.g. Weekly Account) can hold.
export const TASK_LIMIT = 20;

// The game server runs on Singapore time (UTC+8, no daylight saving). Task
// dates and the Server Time clock follow it.
export const SERVER_TIME_ZONE = "Asia/Singapore";
