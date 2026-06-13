import { router } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from '@/tw';

import { CronoIcon, ListIcon } from './crono-icon';
import { useCrono } from './crono-context';
import { canDeleteList, getListCount } from './list-filters';

export function CronoListsPage() {
  const { lists, tasks, recentlyCompletedTaskIds, addList, deleteList } = useCrono();
  const [newListName, setNewListName] = useState('');

  function createList() {
    const trimmed = newListName.trim();
    if (!trimmed) {
      return;
    }

    const list = addList(trimmed);
    setNewListName('');
    router.push(`/lists/${list.id}`);
  }

  function openListOptions(list: (typeof lists)[number]) {
    Alert.alert(list.name, 'List options', [
      { text: 'Cancel', style: 'cancel' },
      ...(canDeleteList(list)
        ? [
            {
              text: 'Delete list',
              style: 'destructive' as const,
              onPress: () => deleteList(list),
            },
          ]
        : []),
    ]);
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView contentContainerClassName="gap-5 px-5 py-3" showsVerticalScrollIndicator={false}>
        <Text className="text-[34px] font-bold tracking-normal text-gray-900">Crono</Text>

        <View className="gap-2">
          {lists.map(list => {
            const count = getListCount(list, tasks, recentlyCompletedTaskIds);

            return (
              <Pressable
                key={list.id}
                onPress={() => router.push(`/lists/${list.id}`)}
                className="min-h-14 flex-row items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3">
                <View className="h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
                  <ListIcon color={list.color} list={list} size={19} />
                </View>
                <Text className="flex-1 text-base font-semibold text-gray-900">{list.name}</Text>
                <Text className="text-base font-bold text-gray-900">{count}</Text>
                {!isSmartOrInbox(list) && (
                  <Pressable
                    accessibilityLabel={`${list.name} options`}
                    onPress={event => {
                      event.stopPropagation();
                      openListOptions(list);
                    }}
                    className="rounded-lg p-1.5">
                    <CronoIcon color="#9ca3af" name="more" size={19} />
                  </Pressable>
                )}
              </Pressable>
            );
          })}
        </View>

        <View className="flex-row gap-2">
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
