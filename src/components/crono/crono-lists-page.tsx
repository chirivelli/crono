import { router } from 'expo-router';
import { useState } from 'react';

import { Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from '@/tw';

import { CronoIcon, ListIcon } from './crono-icon';
import { useCrono } from './crono-context';
import { canDeleteList, getListCount } from './list-filters';
import { cn } from '@/utils/cn';

export function CronoListsPage() {
  const { lists, tasks, recentlyCompletedTaskIds, addList, renameList, deleteList, moveList } = useCrono();
  const [newListName, setNewListName] = useState('');
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [openOptionsListId, setOpenOptionsListId] = useState<string | null>(null);
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingListName, setEditingListName] = useState('');
  const [draggingListId, setDraggingListId] = useState<string | null>(null);
  const [dragOverListId, setDragOverListId] = useState<string | null>(null);
  const [dragOverPosition, setDragOverPosition] = useState<'before' | 'after'>('before');
  const reorderableLists = lists.filter(canDeleteList);

  function createList() {
    const trimmed = newListName.trim();
    if (!trimmed) {
      return;
    }

    const list = addList(trimmed);
    setNewListName('');
    setIsCreatingList(false);
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
        <View className="flex-row items-center justify-between gap-3">
          <Text className="text-[34px] font-bold tracking-normal text-gray-900">Crono</Text>
          <View className="flex-row items-center gap-2">
            <Pressable
              accessibilityLabel="Settings"
              onPress={() => {
                setOpenOptionsListId(null);
                router.push('/settings');
              }}
              className="h-[42px] w-[42px] items-center justify-center rounded-lg border border-gray-200 bg-white">
              <CronoIcon color="#111827" name="settings" size={21} strokeWidth={1.8} />
            </Pressable>
            <Pressable
              accessibilityLabel="Add list"
              onPress={() => {
                setOpenOptionsListId(null);
                setIsCreatingList(true);
              }}
              className="h-[42px] w-[42px] items-center justify-center rounded-lg bg-gray-900">
              <CronoIcon color="#ffffff" name="add" size={22} strokeWidth={2} />
            </Pressable>
          </View>
        </View>

        {isCreatingList && (
          <View className="z-0 flex-row gap-2">
            <TextInput
              autoFocus
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
        )}

        <View className="z-10 gap-2">
          {lists.map(list => {
            const count = getListCount(list, tasks, recentlyCompletedTaskIds);
            const optionsOpen = openOptionsListId === list.id;
            const canShowOptions = !isSmartOrInbox(list);
            const canReorder = canDeleteList(list) && reorderableLists.length > 1;
            const isDragging = draggingListId === list.id;
            const isDropTarget = canReorder && draggingListId !== null && draggingListId !== list.id;
            const rowDataSet: Record<string, string> = {
              listRow: list.id,
              optionsOpen: optionsOpen ? 'true' : 'false',
            };
            if (canReorder) {
              rowDataSet.listReorderId = list.id;
            }
            const dragHandleProps = canReorder
              ? ({
                  onMouseDown: (event: {
                    clientX: number;
                    clientY: number;
                    preventDefault: () => void;
                    stopPropagation: () => void;
                  }) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setOpenOptionsListId(null);
                    setDraggingListId(list.id);

                    const getDropTarget = (clientX: number, clientY: number) => {
                      const dropTarget = document
                        .elementFromPoint(clientX, clientY)
                        ?.closest('[data-list-reorder-id]');
                      const targetListId = dropTarget?.getAttribute('data-list-reorder-id') ?? null;
                      if (!dropTarget || !targetListId || targetListId === list.id) {
                        return null;
                      }

                      const bounds = dropTarget.getBoundingClientRect();
                      const position: 'before' | 'after' =
                        clientY < bounds.top + bounds.height / 2 ? 'before' : 'after';
                      return { position, targetListId };
                    };

                    const handleMouseMove = (mouseEvent: MouseEvent) => {
                      const dropTarget = getDropTarget(mouseEvent.clientX, mouseEvent.clientY);
                      if (dropTarget) {
                        setDragOverListId(dropTarget.targetListId);
                        setDragOverPosition(dropTarget.position);
                      }
                    };

                    const handleMouseUp = (mouseEvent: MouseEvent) => {
                      const dropTarget = getDropTarget(mouseEvent.clientX, mouseEvent.clientY);
                      if (dropTarget) {
                        moveList(list.id, dropTarget.targetListId, dropTarget.position);
                      }

                      setDraggingListId(null);
                      setDragOverListId(null);
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };

                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  },
                } as never)
              : {};
            return (
              <View key={list.id} className="relative">
                {isDropTarget && dragOverListId === list.id && dragOverPosition === 'before' && (
                  <View className="absolute -top-[5px] left-0 right-0 z-20 h-[3px] rounded-full bg-blue-500" />
                )}
                <Pressable
                  dataSet={rowDataSet}
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
                    'relative min-h-14 flex-row items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3',
                    optionsOpen ? 'z-50' : 'z-0',
                    isDragging && 'opacity-50'
                  )}>
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
                  {canShowOptions ? (
                    <Pressable
                      accessibilityLabel={`${list.name} options`}
                      onPress={event => {
                        event.stopPropagation();
                        setOpenOptionsListId(current => (current === list.id ? null : list.id));
                      }}
                      className="relative w-10 items-end justify-center">
                      <Text dataSet={{ listCount: list.id }} className="text-right text-base font-bold text-gray-400">
                        {count}
                      </Text>
                      <View dataSet={{ listMenu: list.id }} className="absolute right-0 w-10 items-end justify-center">
                        <CronoIcon color="#9ca3af" name="more" size={19} />
                      </View>
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
                    </Pressable>
                  ) : (
                    <View className="relative w-10 items-end justify-center">
                      <Text className="text-right text-base font-bold text-gray-400">{count}</Text>
                    </View>
                  )}
                  {canReorder && (
                    <Pressable
                      {...dragHandleProps}
                      accessibilityLabel={`Reorder ${list.name}`}
                      onPress={event => event.stopPropagation()}
                      className="h-7 w-5 cursor-grab items-center justify-center rounded-md active:cursor-grabbing">
                      <View className="gap-[3px]">
                        {[0, 1, 2].map(row => (
                          <View key={row} className="flex-row gap-[4px]">
                            <View className="h-[3px] w-[3px] rounded-full bg-gray-400" />
                            <View className="h-[3px] w-[3px] rounded-full bg-gray-400" />
                          </View>
                        ))}
                      </View>
                    </Pressable>
                  )}
                </Pressable>
                {isDropTarget && dragOverListId === list.id && dragOverPosition === 'after' && (
                  <View className="absolute -bottom-[5px] left-0 right-0 z-20 h-[3px] rounded-full bg-blue-500" />
                )}
              </View>
            );
          })}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function isSmartOrInbox(list: { id: string; kind?: string }) {
  return list.kind === 'all' || list.kind === 'today' || list.kind === 'completed' || list.id === 'inbox';
}
