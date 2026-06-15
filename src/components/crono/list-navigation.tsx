import { router } from 'expo-router';
import { useState } from 'react';

import { Pressable, ScrollView, Text, TextInput, View } from '@/tw';
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
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [openOptionsListId, setOpenOptionsListId] = useState<string | null>(null);
  const [hoveredListId, setHoveredListId] = useState<string | null>(null);
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingListName, setEditingListName] = useState('');

  function submitList() {
    onCreateList(newListName);
    setNewListName('');
    setIsCreatingList(false);
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
      <View className="flex-row items-center justify-between gap-3">
        <Text className="text-[34px] font-bold tracking-normal text-gray-900">Crono</Text>
        <View className="flex-row items-center gap-2">
          <Pressable
            accessibilityLabel="Settings"
            onPress={() => {
              setOpenOptionsListId(null);
              router.push('/settings');
            }}
            className="h-[38px] w-[38px] items-center justify-center rounded-lg border border-gray-200 bg-white">
            <CronoIcon color="#111827" name="settings" size={20} strokeWidth={1.8} />
          </Pressable>
          <Pressable
            accessibilityLabel="Add list"
            onPress={() => {
              setOpenOptionsListId(null);
              setIsCreatingList(true);
            }}
            className="h-[38px] w-[38px] items-center justify-center rounded-lg bg-gray-900">
            <CronoIcon color="#ffffff" name="add" size={21} strokeWidth={2} />
          </Pressable>
        </View>
      </View>

      {isCreatingList && (
        <View className="flex-row gap-2">
          <TextInput
            autoFocus
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
      )}

      <ScrollView
        horizontal={!showSidebar}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerClassName={showSidebar ? 'z-10 gap-2 pb-1' : 'z-10 gap-2'}>
        {lists.map(list => {
          const selected = list.id === selectedListId;
          const count = getListCount(list, tasks, recentlyCompletedTaskIds);
          const optionsOpen = openOptionsListId === list.id;
          const canShowOptions = !isSmartOrInbox(list);
          const optionsVisible = canShowOptions && (hoveredListId === list.id || optionsOpen);

          return (
            <Pressable
              key={list.id}
              onHoverIn={() => setHoveredListId(list.id)}
              onHoverOut={() => setHoveredListId(current => (current === list.id ? null : current))}
              onPointerEnter={() => setHoveredListId(list.id)}
              onPointerLeave={() => setHoveredListId(current => (current === list.id ? null : current))}
              onLongPress={() => {
                if (canShowOptions) {
                  setOpenOptionsListId(list.id);
                }
              }}
              onPress={() => {
                setOpenOptionsListId(null);
                router.push(`/lists/${list.id}`);
              }}
              className={cn(
                'relative min-h-12 min-w-[148px] flex-row items-center gap-2.5 rounded-lg border bg-white px-3 py-2.5',
                optionsOpen ? 'z-50' : 'z-0',
                selected ? 'border-gray-900' : 'border-gray-200'
              )}>
              <View className="h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                <ListIcon color={list.color} list={list} />
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
              <View className="relative w-8 items-end justify-center">
                {canShowOptions && optionsVisible ? (
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
                    {optionsOpen && (
                      <View className="absolute right-0 top-8 z-50 min-w-32 rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
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
                ) : (
                  <Text className="text-right text-base font-bold text-gray-900">{count}</Text>
                )}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

    </View>
  );
}

function isSmartOrInbox(list: CronoList) {
  return list.kind === 'all' || list.kind === 'today' || list.kind === 'completed' || list.id === 'inbox';
}
