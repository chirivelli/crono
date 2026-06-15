import { router } from 'expo-router';
import { useWindowDimensions } from 'react-native';

import { SafeAreaView, View } from '@/tw';
import { cn } from '@/utils/cn';

import { useCrono, CronoProvider } from './crono-context';
import { getDefaultList } from './list-filters';
import { ListNavigation } from './list-navigation';
import { TaskList } from './task-list';

export { CronoProvider };

export function CronoApp({ listId }: { listId?: string }) {
  const { lists, tasks, recentlyCompletedTaskIds, addList, renameList, deleteList } = useCrono();
  const { width } = useWindowDimensions();
  const selectedList = lists.find(list => list.id === listId) ?? getDefaultList(lists);
  const showSidebar = width >= 720;

  function createList(name: string) {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }

    const list = addList(trimmed);
    router.replace(`/lists/${list.id}`);
  }

  async function removeList(list: (typeof lists)[number]) {
    await deleteList(list);
    if (selectedList.id === list.id) {
      const remainingLists = lists.filter(item => item.id !== list.id);
      router.replace(`/lists/${getDefaultList(remainingLists).id}`);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className={cn('flex-1 px-5 pt-2.5', showSidebar && 'pl-0 pt-0')}>
        <View className={cn('min-h-0 flex-1', showSidebar && 'flex-row gap-6')}>
          {showSidebar && (
            <ListNavigation
              lists={lists}
              tasks={tasks}
              recentlyCompletedTaskIds={recentlyCompletedTaskIds}
              selectedListId={selectedList.id}
              onCreateList={createList}
              onRenameList={renameList}
              onDeleteList={removeList}
              showSidebar={showSidebar}
            />
          )}
          <TaskList list={selectedList} lists={lists} />
        </View>
      </View>
    </SafeAreaView>
  );
}
