import { useState } from 'react';
import { Alert } from 'react-native';

import { Link, Pressable, ScrollView, Text, TextInput, View } from '@/tw';
import { cn } from '@/utils/cn';

import { CronoIcon, ListIcon } from './crono-icon';
import { canDeleteList, getListCount } from './list-filters';
import type { CronoList, Task } from './types';

export function ListNavigation({
  lists,
  tasks,
  recentlyCompletedTaskIds,
  selectedListId,
  onCreateList,
  onDeleteList,
  showSidebar,
}: {
  lists: CronoList[];
  tasks: Task[];
  recentlyCompletedTaskIds: Set<string>;
  selectedListId: string;
  onCreateList: (name: string) => void;
  onDeleteList: (list: CronoList) => void;
  showSidebar: boolean;
}) {
  const [newListName, setNewListName] = useState('');

  function submitList() {
    onCreateList(newListName);
    setNewListName('');
  }

  function openListOptions(list: CronoList) {
    Alert.alert(list.name, 'List options', [
      { text: 'Cancel', style: 'cancel' },
      ...(canDeleteList(list)
        ? [
            {
              text: 'Delete list',
              style: 'destructive' as const,
              onPress: () => onDeleteList(list),
            },
          ]
        : []),
    ]);
  }

  return (
    <View className={cn('gap-3', showSidebar ? 'mb-0 w-[280px] border-r border-gray-200 bg-gray-100 p-5' : 'mb-[18px] shrink-0')}>
      <Text className="text-[34px] font-bold tracking-normal text-gray-900">Crono</Text>

      <ScrollView
        horizontal={!showSidebar}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerClassName={showSidebar ? 'gap-2 pb-1' : 'gap-2'}>
        {lists.map(list => {
          const selected = list.id === selectedListId;
          const count = getListCount(list, tasks, recentlyCompletedTaskIds);

          return (
            <Link key={list.id} href={`/lists/${list.id}`} asChild>
              <Pressable
                className={cn(
                  'min-h-12 min-w-[148px] flex-row items-center gap-2.5 rounded-lg border bg-white px-3 py-2.5',
                  selected ? 'border-gray-900' : 'border-gray-200'
                )}>
                <View className="h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                  <ListIcon color={selected ? list.color : '#6b7280'} list={list} />
                </View>
                <Text className={cn('flex-1 text-[15px] font-semibold', selected ? 'text-gray-900' : 'text-gray-500')}>
                  {list.name}
                </Text>
                <Text className="text-base font-bold text-gray-900">{count}</Text>
                {!isSmartOrInbox(list) && (
                  <Pressable
                    accessibilityLabel={`${list.name} options`}
                    onPress={event => {
                      event.stopPropagation();
                      openListOptions(list);
                    }}
                    className="rounded-lg p-1">
                    <CronoIcon color="#9ca3af" name="more" size={18} />
                  </Pressable>
                )}
              </Pressable>
            </Link>
          );
        })}
      </ScrollView>

      <View className="flex-row gap-2">
        <TextInput
          value={newListName}
          onChangeText={setNewListName}
          onSubmitEditing={submitList}
          placeholder="New list"
          placeholderTextColor="#9ca3af"
          returnKeyType="done"
          className="min-h-[42px] flex-1 rounded-lg border border-gray-200 bg-white px-3 text-[15px] text-gray-900"
        />
        <Pressable onPress={submitList} className="h-[42px] w-[42px] items-center justify-center rounded-lg bg-gray-900">
          <CronoIcon color="#ffffff" name="add" size={22} strokeWidth={2} />
        </Pressable>
      </View>
    </View>
  );
}

function isSmartOrInbox(list: CronoList) {
  return list.kind === 'all' || list.kind === 'today' || list.kind === 'completed' || list.id === 'inbox';
}
