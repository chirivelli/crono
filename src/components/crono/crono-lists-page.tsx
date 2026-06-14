import { router } from 'expo-router';
import { useState } from 'react';

import { Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from '@/tw';

import { CronoIcon, ListIcon } from './crono-icon';
import { useCrono } from './crono-context';
import { canDeleteList, getListCount } from './list-filters';

export function CronoListsPage() {
  const { lists, tasks, recentlyCompletedTaskIds, addList, renameList, deleteList } = useCrono();
  const [newListName, setNewListName] = useState('');
  const [openOptionsListId, setOpenOptionsListId] = useState<string | null>(null);
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingListName, setEditingListName] = useState('');

  function createList() {
    const trimmed = newListName.trim();
    if (!trimmed) {
      return;
    }

    const list = addList(trimmed);
    setNewListName('');
    router.push(`/lists/${list.id}`);
  }

  function startRename(list: (typeof lists)[number]) {
    setEditingListId(list.id);
    setEditingListName(list.name);
    setOpenOptionsListId(null);
  }

  function submitRename(list: (typeof lists)[number]) {
    renameList(list, editingListName);
    setEditingListId(null);
    setEditingListName('');
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView contentContainerClassName="gap-5 px-5 py-3" showsVerticalScrollIndicator={false}>
        <Text className="text-[34px] font-bold tracking-normal text-gray-900">Crono</Text>

        <View className="z-10 gap-2">
          {lists.map(list => {
            const count = getListCount(list, tasks, recentlyCompletedTaskIds);
            const optionsOpen = openOptionsListId === list.id;

            return (
              <Pressable
                key={list.id}
                onPress={() => {
                  setOpenOptionsListId(null);
                  router.push(`/lists/${list.id}`);
                }}
                className={optionsOpen ? 'relative z-50 min-h-14 flex-row items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3' : 'relative z-0 min-h-14 flex-row items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3'}>
                <View className="h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
                  <ListIcon color={list.color} list={list} size={19} />
                </View>
                {editingListId === list.id ? (
                  <TextInput
                    autoFocus
                    value={editingListName}
                    onChangeText={setEditingListName}
                    onBlur={() => submitRename(list)}
                    onSubmitEditing={() => submitRename(list)}
                    returnKeyType="done"
                    className="min-h-[34px] flex-1 rounded-md border border-gray-200 bg-white px-2 text-base font-semibold text-gray-900"
                  />
                ) : (
                  <Text className="flex-1 text-base font-semibold text-gray-900">{list.name}</Text>
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
                      className="rounded-lg p-1.5">
                      <CronoIcon color="#9ca3af" name="more" size={19} />
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
                              deleteList(list);
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
            );
          })}
        </View>

        <View className="z-0 flex-row gap-2">
          <TextInput
            value={newListName}
            onChangeText={setNewListName}
            onSubmitEditing={createList}
            placeholder="New list"
            placeholderTextColor="#9ca3af"
            returnKeyType="done"
            className="min-h-[42px] flex-1 rounded-lg border border-gray-200 bg-white px-3 text-[15px] text-gray-900"
          />
          <Pressable onPress={createList} className="h-[42px] w-[42px] items-center justify-center rounded-lg bg-gray-900">
            <CronoIcon color="#ffffff" name="add" size={22} strokeWidth={2} />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function isSmartOrInbox(list: { id: string; kind?: string }) {
  return list.kind === 'all' || list.kind === 'today' || list.kind === 'completed' || list.id === 'inbox';
}
