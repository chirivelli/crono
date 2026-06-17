import { useMemo, useRef, useState } from 'react';

import { Platform, useWindowDimensions } from 'react-native';

import { Pressable, Text, View } from '@/tw';
import { cn } from '@/utils/cn';

import { CronoIcon } from './crono-icon';
import { HighlightedTaskInput } from './highlighted-task-input';
import { SwipeableTaskRow } from './swipeable-task-row';
import {
  cleanTaskTitle,
  formatDueDate,
  isDueAtOverdue,
  isTaskOverdue,
  mergeEditedReminder,
  parseTaskInput,
  splitReminderLabel,
} from './task-parser';
import type { Recurrence, Task } from './types';

export function TaskRow({
  canMoveDown = false,
  canMoveUp = false,
  dragOverPosition,
  draggingTaskId,
  sourceListName,
  task,
  onDelete,
  onMove,
  onTaskDragEnd,
  onTaskDragOver,
  onTaskDragStart,
  onToggle,
  onUpdate,
}: {
  canMoveDown?: boolean;
  canMoveUp?: boolean;
  dragOverPosition?: 'before' | 'after' | null;
  draggingTaskId?: string | null;
  sourceListName?: string;
  task: Task;
  onDelete: (task: Task) => Promise<void>;
  onMove: (taskId: string, targetTaskId: string, position: 'before' | 'after') => void;
  onTaskDragEnd?: () => void;
  onTaskDragOver?: (taskId: string, position: 'before' | 'after') => void;
  onTaskDragStart?: (taskId: string) => void;
  onToggle: (task: Task) => void;
  onUpdate: (task: Task, input: { title: string; dueAt: string | null; dueLabel: string | null; recurrence: Recurrence }) => Promise<void>;
}) {
  const { width } = useWindowDimensions();
  const isSubmittingSmartEdit = useRef(false);
  const dueLabel = task.dueLabel !== undefined ? task.dueLabel : formatDueDate(task.dueAt);
  const overdue = isTaskOverdue(task);
  const detailParts = [
    sourceListName ? { key: 'source', value: sourceListName, className: 'font-semibold text-gray-400' } : null,
    dueLabel ? { key: 'due', value: dueLabel, className: overdue ? 'text-red-600' : undefined } : null,
    task.recurrence !== 'none' ? { key: 'recurrence', value: task.recurrence } : null,
  ].filter(part => part !== null);
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(task.title);
  const parsedDraft = useMemo(() => parseTaskInput(draftTitle), [draftTitle]);
  const previewReminder = mergeEditedReminder(task, parsedDraft);
  const editingDueLabel = previewReminder.dueLabel ?? dueLabel;
  const editingDueLabelParts = parsedDraft.detectedReminder ? splitReminderLabel(previewReminder.dueLabel) : splitReminderLabel(editingDueLabel);
  const editingRecurrence = parsedDraft.recurrence !== 'none' ? parsedDraft.recurrence : task.recurrence;
  const editingOverdue = isDueAtOverdue(previewReminder.dueAt);

  function startEditing() {
    setDraftTitle(task.title);
    setIsEditing(true);
  }

  async function saveSmartEdit() {
    const title = cleanTaskTitle(draftTitle, parsedDraft);
    if (!title) {
      setDraftTitle(task.title);
      setIsEditing(false);
      return;
    }

    isSubmittingSmartEdit.current = true;
    await onUpdate(task, {
      title,
      dueAt: previewReminder.dueAt,
      dueLabel: previewReminder.dueLabel,
      recurrence: parsedDraft.recurrence === 'none' ? task.recurrence : parsedDraft.recurrence,
    });
    isSubmittingSmartEdit.current = false;
    setIsEditing(false);
  }

  async function savePlainEdit() {
    if (isSubmittingSmartEdit.current) {
      return;
    }

    const title = draftTitle.trim();
    if (!title) {
      setDraftTitle(task.title);
      setIsEditing(false);
      return;
    }

    await onUpdate(task, {
      title,
      dueAt: task.dueAt,
      dueLabel: task.dueLabel ?? null,
      recurrence: task.recurrence,
    });
    setIsEditing(false);
  }

  const showSwipeDelete = width < 760 && Platform.OS !== 'web';
  const showReorderHandle = canMoveUp || canMoveDown;
  const isDropTarget = Boolean(draggingTaskId && draggingTaskId !== task.id && showReorderHandle);
  const isDragging = draggingTaskId === task.id;
  const rowDataSet = showReorderHandle ? { taskId: task.id } : undefined;
  const dragHandleProps =
    Platform.OS === 'web' && showReorderHandle
      ? ({
          onMouseDown: (event: { clientX: number; clientY: number; preventDefault: () => void }) => {
            event.preventDefault();
            onTaskDragStart?.(task.id);

            const getDropTarget = (clientX: number, clientY: number) => {
              const dropTarget = document
                .elementFromPoint(clientX, clientY)
                ?.closest('[data-task-id]');
              const targetTaskId = dropTarget?.getAttribute('data-task-id') ?? null;
              if (!dropTarget || !targetTaskId || targetTaskId === task.id) {
                return null;
              }

              const bounds = dropTarget.getBoundingClientRect();
              const position: 'before' | 'after' = clientY < bounds.top + bounds.height / 2 ? 'before' : 'after';
              return { position, targetTaskId };
            };

            const handleMouseMove = (mouseEvent: MouseEvent) => {
              const dropTarget = getDropTarget(mouseEvent.clientX, mouseEvent.clientY);
              if (dropTarget) {
                onTaskDragOver?.(dropTarget.targetTaskId, dropTarget.position);
              }
            };

            const handleMouseUp = (mouseEvent: MouseEvent) => {
              const dropTarget = getDropTarget(mouseEvent.clientX, mouseEvent.clientY);
              if (dropTarget) {
                onMove(task.id, dropTarget.targetTaskId, dropTarget.position);
              }

              onTaskDragEnd?.();
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          },
        } as never)
      : {};
  const row = (
    <View className="relative mb-2">
      {isDropTarget && dragOverPosition === 'before' && (
        <View className="absolute -top-[5px] left-0 right-0 z-10 h-[3px] rounded-full bg-blue-500" />
      )}
      <View
        dataSet={rowDataSet}
        className={cn(
          'flex-row items-start gap-3 rounded-lg border bg-white p-3',
          'border-gray-200',
          isDragging && 'opacity-50'
        )}>
        <Pressable
          onPress={() => onToggle(task)}
          className={cn(
            'mt-px h-[22px] w-[22px] items-center justify-center rounded-[10px] border-[1.5px]',
            task.completed ? 'border-gray-900 bg-gray-900' : 'border-gray-400'
          )}>
          {task.completed && <CronoIcon color="#ffffff" name="check" size={14} strokeWidth={2.4} />}
        </Pressable>
        <View className="flex-1">
          {isEditing ? (
            <>
              <HighlightedTaskInput
                autoFocus
                value={draftTitle}
                onBlur={savePlainEdit}
                onChangeText={setDraftTitle}
                onSubmitEditing={saveSmartEdit}
                parsedInput={parsedDraft}
                className="min-h-5 p-0 text-base font-medium leading-5 text-gray-900"
              />
              {(editingDueLabel || editingRecurrence !== 'none') && (
                <View className="mt-1.5 flex-row flex-wrap gap-2">
                  {editingDueLabelParts.map(part => (
                    <Text
                      key={part}
                      className={cn(
                        'overflow-hidden rounded-lg bg-gray-100 px-2 py-1 text-[13px] text-gray-600',
                        editingOverdue && 'text-red-600'
                      )}>
                      {part}
                    </Text>
                  ))}
                  {editingRecurrence !== 'none' && (
                    <Text className="overflow-hidden rounded-lg bg-gray-100 px-2 py-1 text-[13px] text-gray-600">
                      Repeats {editingRecurrence}
                    </Text>
                  )}
                </View>
              )}
            </>
          ) : (
            <Pressable onPress={startEditing}>
              <Text className={cn('text-base font-medium leading-5 text-gray-900', task.completed && 'text-gray-400 line-through')}>
                {task.title}
              </Text>
              {detailParts.length > 0 && (
                <Text
                  className="mt-1 text-[13px] leading-[18px] text-gray-500"
                  accessibilityLabel={detailParts.map(part => part.value).join(' · ')}>
                  {detailParts.map((part, index) => (
                    <Text key={part.key}>
                      {index > 0 && <Text> · </Text>}
                      <Text className={part.className}>{part.value}</Text>
                    </Text>
                  ))}
                </Text>
              )}
            </Pressable>
          )}
        </View>
        {!showSwipeDelete && (
          <Pressable accessibilityLabel={`Delete ${task.title}`} onPress={() => onDelete(task)} className="rounded-lg px-2 py-1">
            <CronoIcon color="#9ca3af" name="delete" size={17} />
          </Pressable>
        )}
        {showReorderHandle && (
          <Pressable
            {...dragHandleProps}
            accessibilityLabel={`Reorder ${task.title}`}
            className="mt-[-1px] h-7 w-5 cursor-grab items-center justify-center rounded-md active:cursor-grabbing">
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
      </View>
      {isDropTarget && dragOverPosition === 'after' && (
        <View className="absolute -bottom-[5px] left-0 right-0 z-10 h-[3px] rounded-full bg-blue-500" />
      )}
    </View>
  );

  return (
    <SwipeableTaskRow enabled={showSwipeDelete} onDelete={() => onDelete(task)}>
      {row}
    </SwipeableTaskRow>
  );
}
