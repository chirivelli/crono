import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Alert } from 'react-native';

import { createDefaultTasks, defaultLists, listColors } from './default-data';
import { canDeleteList } from './list-filters';
import { cancelReminder, scheduleReminder } from './notifications';
import type { CronoList, Task, TaskInput, TaskUpdateInput } from './types';

type CronoContextValue = {
  lists: CronoList[];
  tasks: Task[];
  recentlyCompletedTaskIds: Set<string>;
  addList: (name: string) => CronoList;
  renameList: (list: CronoList, name: string) => void;
  deleteList: (list: CronoList) => Promise<void>;
  moveList: (listId: string, targetListId: string, position: 'before' | 'after') => void;
  addTask: (input: TaskInput) => Promise<void>;
  updateTask: (task: Task, input: TaskUpdateInput) => Promise<void>;
  deleteTask: (task: Task) => Promise<void>;
  moveTask: (taskId: string, targetTaskId: string, position: 'before' | 'after') => void;
  toggleTask: (task: Task) => Promise<void>;
};

const CronoContext = createContext<CronoContextValue | null>(null);

export function CronoProvider({ children }: { children: ReactNode }) {
  const [lists, setLists] = useState<CronoList[]>(defaultLists);
  const [tasks, setTasks] = useState<Task[]>(createDefaultTasks);
  const [recentlyCompletedTaskIds, setRecentlyCompletedTaskIds] = useState<Set<string>>(new Set());
  const recentlyCompletedTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  useEffect(() => {
    const timers = recentlyCompletedTimers.current;
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, []);

  function addList(name: string) {
    const list: CronoList = {
      id: slugify(name, lists),
      name: name.trim(),
      color: listColors[lists.length % listColors.length],
      kind: 'list',
    };

    setLists(current => [...current, list]);
    return list;
  }

  function renameList(list: CronoList, name: string) {
    if (!canDeleteList(list)) {
      return;
    }

    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }

    setLists(current => current.map(item => (item.id === list.id ? { ...item, name: trimmed } : item)));
  }

  async function deleteList(list: CronoList) {
    if (!canDeleteList(list)) {
      return;
    }

    const listTasks = tasks.filter(task => task.listId === list.id);
    listTasks.forEach(task => clearRecentlyCompletedTask(task.id));
    await Promise.all(listTasks.map(task => cancelReminder(task.notificationId)));
    setTasks(current => current.filter(task => task.listId !== list.id));
    setLists(current => current.filter(item => item.id !== list.id));
  }

  function moveList(listId: string, targetListId: string, position: 'before' | 'after') {
    setLists(current => {
      const reorderableLists = current.filter(canDeleteList);
      const currentListIndex = reorderableLists.findIndex(list => list.id === listId);
      const targetListIndex = reorderableLists.findIndex(list => list.id === targetListId);
      if (currentListIndex === -1 || targetListIndex === -1 || currentListIndex === targetListIndex) {
        return current;
      }

      const reorderedLists = [...reorderableLists];
      const [movedList] = reorderedLists.splice(currentListIndex, 1);
      const adjustedTargetIndex = currentListIndex < targetListIndex ? targetListIndex - 1 : targetListIndex;
      const insertionIndex = position === 'after' ? adjustedTargetIndex + 1 : adjustedTargetIndex;
      reorderedLists.splice(insertionIndex, 0, movedList);

      let nextListIndex = 0;
      return current.map(list => {
        if (!canDeleteList(list)) {
          return list;
        }

        const nextList = reorderedLists[nextListIndex];
        nextListIndex += 1;
        return nextList;
      });
    });
  }

  async function addTask(input: TaskInput) {
    const task: Task = {
      id: `${Date.now()}`,
      title: input.title,
      listId: input.listId,
      completed: false,
      dueAt: input.dueAt,
      dueLabel: input.dueLabel,
      recurrence: input.recurrence,
    };

    try {
      const notificationId = await scheduleReminder(task);
      setTasks(current => [{ ...task, notificationId }, ...current]);
    } catch {
      Alert.alert('Reminder not scheduled', 'The task was added, but Crono could not schedule its notification.');
      setTasks(current => [task, ...current]);
    }
  }

  async function updateTask(task: Task, input: TaskUpdateInput) {
    await cancelReminder(task.notificationId);

    const updatedTask: Task = {
      ...task,
      title: input.title,
      dueAt: input.dueAt,
      dueLabel: input.dueLabel,
      recurrence: input.recurrence,
      notificationId: undefined,
    };

    try {
      const notificationId = task.completed ? undefined : await scheduleReminder(updatedTask);
      setTasks(current =>
        current.map(item => (item.id === task.id ? { ...updatedTask, notificationId } : item))
      );
    } catch {
      Alert.alert('Reminder not scheduled', 'The task was updated, but Crono could not schedule its notification.');
      setTasks(current => current.map(item => (item.id === task.id ? updatedTask : item)));
    }
  }

  async function toggleTask(task: Task) {
    if (!task.completed) {
      await cancelReminder(task.notificationId);
      clearRecentlyCompletedTask(task.id);
      setRecentlyCompletedTaskIds(current => new Set(current).add(task.id));
      recentlyCompletedTimers.current.set(
        task.id,
        setTimeout(() => {
          recentlyCompletedTimers.current.delete(task.id);
          setRecentlyCompletedTaskIds(current => {
            const next = new Set(current);
            next.delete(task.id);
            return next;
          });
        }, 3000)
      );
    } else {
      clearRecentlyCompletedTask(task.id);
    }

    setTasks(current =>
      current.map(item => (item.id === task.id ? { ...item, completed: !item.completed } : item))
    );
  }

  async function deleteTask(task: Task) {
    clearRecentlyCompletedTask(task.id);
    await cancelReminder(task.notificationId);
    setTasks(current => current.filter(item => item.id !== task.id));
  }

  function moveTask(taskId: string, targetTaskId: string, position: 'before' | 'after') {
    setTasks(current => {
      const task = current.find(item => item.id === taskId);
      const targetTask = current.find(item => item.id === targetTaskId);
      if (!task || !targetTask || task.id === targetTask.id || task.listId !== targetTask.listId || task.completed || targetTask.completed) {
        return current;
      }

      const listTasks = current.filter(item => item.listId === task.listId && !item.completed);
      const currentListIndex = listTasks.findIndex(item => item.id === task.id);
      const targetListIndex = listTasks.findIndex(item => item.id === targetTask.id);
      if (currentListIndex === -1 || targetListIndex === -1) {
        return current;
      }

      const reorderedListTasks = [...listTasks];
      const [movedTask] = reorderedListTasks.splice(currentListIndex, 1);
      const adjustedTargetIndex = currentListIndex < targetListIndex ? targetListIndex - 1 : targetListIndex;
      const insertionIndex = position === 'after' ? adjustedTargetIndex + 1 : adjustedTargetIndex;
      reorderedListTasks.splice(insertionIndex, 0, movedTask);

      let nextListTaskIndex = 0;
      return current.map(item => {
        if (item.listId !== task.listId || item.completed) {
          return item;
        }

        const nextTask = reorderedListTasks[nextListTaskIndex];
        nextListTaskIndex += 1;
        return nextTask;
      });
    });
  }

  function clearRecentlyCompletedTask(taskId: string) {
    const timer = recentlyCompletedTimers.current.get(taskId);
    if (timer) {
      clearTimeout(timer);
      recentlyCompletedTimers.current.delete(taskId);
    }
    setRecentlyCompletedTaskIds(current => {
      const next = new Set(current);
      next.delete(taskId);
      return next;
    });
  }

  return (
    <CronoContext.Provider
      value={{ lists, tasks, recentlyCompletedTaskIds, addList, renameList, deleteList, moveList, addTask, updateTask, deleteTask, moveTask, toggleTask }}>
      {children}
    </CronoContext.Provider>
  );
}

export function useCrono() {
  const value = useContext(CronoContext);
  if (!value) {
    throw new Error('Crono components must be rendered inside CronoProvider.');
  }

  return value;
}

function slugify(name: string, existingLists: CronoList[]) {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'list';
  let candidate = base;
  let suffix = 2;

  while (existingLists.some(list => list.id === candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}
