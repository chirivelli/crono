import Swipeable from 'react-native-gesture-handler/Swipeable';

import { Pressable, Text, View } from '@/tw';

import { CronoIcon } from './crono-icon';

export function SwipeableTaskRow({
  children,
  enabled,
  onDelete,
}: {
  children: React.ReactNode;
  enabled: boolean;
  onDelete: () => void;
}) {
  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <Swipeable
      overshootRight={false}
      renderRightActions={() => (
        <Pressable
          accessibilityLabel="Delete task"
          onPress={onDelete}
          className="mb-2 ml-2 w-24 items-center justify-center rounded-lg bg-red-600">
          <CronoIcon color="#ffffff" name="delete" size={20} />
          <Text className="mt-1 text-[12px] font-bold text-white">Delete</Text>
        </Pressable>
      )}>
      <View>{children}</View>
    </Swipeable>
  );
}
