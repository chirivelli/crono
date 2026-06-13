import { startOfToday } from './task-parser';
import type { CronoList, Task } from './types';

export function getDefaultList(lists: CronoList[]) {
  return lists.find(list => list.id === 'inbox' && list.kind !== 'today' && list.kind !== 'completed') ?? lists[0];
}

export function getTaskList(task: Task, lists: CronoList[]) {
  return lists.find(list => list.id === task.listId);
}

export function getVisibleTasks(list: CronoList, tasks: Task[], recentlyCompletedTaskIds = new Set<string>()) {
  if (list.kind === 'all') {
    return tasks.filter(task => !task.completed || recentlyCompletedTaskIds.has(task.id));
  }

  if (list.kind === 'today') {
    return tasks.filter(task => (!task.completed || recentlyCompletedTaskIds.has(task.id)) && isDueToday(task));
  }

  if (list.kind === 'completed') {
    return tasks.filter(task => task.completed);
  }

  return tasks.filter(task => task.listId === list.id && (!task.completed || recentlyCompletedTaskIds.has(task.id)));
}

export function getListCount(list: CronoList, tasks: Task[], recentlyCompletedTaskIds = new Set<string>()) {
  return getVisibleTasks(list, tasks, recentlyCompletedTaskIds).length;
}

export function isSmartList(list: CronoList) {
  return list.kind === 'all' || list.kind === 'today' || list.kind === 'completed';
}

export function canDeleteList(list: CronoList) {
  return !isSmartList(list) && list.id !== 'inbox';
}

function isDueToday(task: Task) {
  if (!task.dueAt) {
    return false;
  }

  const dueAt = new Date(task.dueAt);
  const today = startOfToday();
  return (
    dueAt.getFullYear() === today.getFullYear() &&
    dueAt.getMonth() === today.getMonth() &&
    dueAt.getDate() === today.getDate()
  );
}
