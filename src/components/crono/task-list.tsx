import { Link, ScrollView, Text, View } from '@/tw';

import { useCrono } from './crono-context';
import { InlineTaskComposer } from './inline-task-composer';
import { getTaskList, getVisibleTasks, isSmartList } from './list-filters';
import { TaskRow } from './task-row';
import type { CronoList } from './types';

export function TaskList({
  list,
  lists,
}: {
  list: CronoList;
  lists: CronoList[];
}) {
  const { tasks, recentlyCompletedTaskIds, addTask, updateTask, deleteTask, toggleTask } = useCrono();
  const visibleTasks = getVisibleTasks(list, tasks, recentlyCompletedTaskIds);
  const completedTasks = list.kind === 'list' ? tasks.filter(task => task.listId === list.id && task.completed) : [];
  const showComposer = !isSmartList(list);
  const allSections =
    list.kind === 'all'
      ? lists
          .filter(item => !isSmartList(item))
          .map(item => ({
            list: item,
            tasks: visibleTasks.filter(task => task.listId === item.id),
          }))
          .filter(section => section.tasks.length > 0)
      : [];

  return (
    <View className="min-w-0 flex-1 pt-2.5">
      <Link href="/lists" className="mb-3 self-start text-[15px] font-semibold text-blue-600">
        Lists
      </Link>
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-[32px] font-bold text-gray-900">{list.name}</Text>
        <Text className="text-sm text-gray-500">
          {visibleTasks.length} {visibleTasks.length === 1 ? 'task' : 'tasks'}
        </Text>
      </View>

      <ScrollView contentContainerClassName="pb-8" showsVerticalScrollIndicator={false}>
        {showComposer && <InlineTaskComposer listId={list.id} onAddTask={addTask} />}

        {visibleTasks.length === 0 ? (
          <Text className="py-6 text-center text-[15px] text-gray-400">
            {isSmartList(list) ? 'No tasks to show.' : 'No tasks in this list.'}
          </Text>
        ) : list.kind === 'all' ? (
          allSections.map((section, index) => (
            <View key={section.list.id}>
              <Text className={index === 0 ? 'mb-2 text-[13px] font-bold uppercase text-gray-500' : 'mb-2 mt-[18px] text-[13px] font-bold uppercase text-gray-500'}>
                {section.list.name}
              </Text>
              {section.tasks.map(task => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onDelete={deleteTask}
                  onToggle={toggleTask}
                  onUpdate={updateTask}
                />
              ))}
            </View>
          ))
        ) : (
          visibleTasks.map(task => (
            <TaskRow
              key={task.id}
              sourceListName={list.kind === 'today' || list.kind === 'completed' ? getTaskList(task, lists)?.name : undefined}
              task={task}
              onDelete={deleteTask}
              onToggle={toggleTask}
              onUpdate={updateTask}
            />
          ))
        )}

        {completedTasks.length > 0 && (
          <>
            <Text className="mb-2 mt-[18px] text-[13px] font-bold uppercase text-gray-500">Completed</Text>
            {completedTasks.map(task => (
              <TaskRow
                key={task.id}
                task={task}
                onDelete={deleteTask}
                onToggle={toggleTask}
                onUpdate={updateTask}
              />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}
