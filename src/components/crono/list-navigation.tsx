import { useState } from 'react';

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
  onRenameList,
  onDeleteList,
  showSidebar,
}: {
  lists: CronoList[];
  tasks: Task[];
  recentlyCompletedTaskIds: Set<string>;
  selectedListId: string;
  onCreateList: (name: string) => void;
  onRenameList: (list: CronoList, name: string) => void;
  onDeleteList: (list: CronoList) => void;
  showSidebar: boolean;
}) {
  const [newListName, setNewListName] = useState('');
  const [openOptionsListId, setOpenOptionsListId] = useState<string | null>(null);
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingListName, setEditingListName] = useState('');

  function submitList() {
    onCreateList(newListName);
    setNewListName('');
  }

  function startRename(list: CronoList) {
    setEditingListId(list.id);
    setEditingListName(list.name);
    setOpenOptionsListId(null);
  }

  function submitRename(list: CronoList) {
    onRenameList(list, editingListName);
    setEditingListId(null);
    setEditingListName('');
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
                  'relative min-h-12 min-w-[148px] flex-row items-center gap-2.5 rounded-lg border bg-white px-3 py-2.5',
                  selected ? 'border-gray-900' : 'border-gray-200'
                )}>
                <View className="h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                  <ListIcon color={selected ? list.color : '#6b7280'} list={list} />
                </View>
                {editingListId === list.id ? (
                  <TextInput
                    autoFocus
                    value={editingListName}
                    onChangeText={setEditingListName}
                    onBlur={() => submitRename(list)}
                    onSubmitEditing={() => submitRename(list)}
                    returnKeyType="done"
                    className="min-h-[32px] flex-1 rounded-md border border-gray-200 bg-white px-2 text-[15px] font-semibold text-gray-900"
                  />
                ) : (
                  <Text className={cn('flex-1 text-[15px] font-semibold', selected ? 'text-gray-900' : 'text-gray-500')}>
                    {list.name}
                  </Text>
                )}
                <Text className="text-base font-bold text-gray-900">{count}</Text>
                {!isSmartOrInbox(list) && (
                  <View>
                    <Pressable
                      accessibilityLabel={`${list.name} options`}
                      onPress={event => {
                        event.stopPropagation();
                        setOpenOptionsListId(current => (current === list.id ? null : list.id));
                      }}
                      className="rounded-lg p-1">
                      <CronoIcon color="#9ca3af" name="more" size={18} />
                    </Pressable>
                    {openOptionsListId === list.id && (
                      <View className="absolute right-0 top-8 z-10 min-w-32 rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
                        <Pressable
                          onPress={event => {
                            event.stopPropagation();
                            startRename(list);
                          }}
                          className="rounded-md px-3 py-2">
                          <Text className="text-[15px] font-semibold text-gray-900">Rename</Text>
                        </Pressable>
                        {canDeleteList(list) && (
                          <Pressable
                            onPress={event => {
                              event.stopPropagation();
                              setOpenOptionsListId(null);
                              onDeleteList(list);
                            }}
                            className="rounded-md px-3 py-2">
                            <Text className="text-[15px] font-semibold text-red-600">Delete</Text>
                          </Pressable>
                        )}
                      </View>
                    )}
                  </View>
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
