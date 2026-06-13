import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  CalendarCheckIcon,
  CheckIcon,
  CheckmarkCircle02Icon,
  Delete02Icon,
  Folder01Icon,
  InboxIcon,
  ListViewIcon,
  MoreHorizontalIcon,
  PlusSignIcon,
  Settings02Icon,
} from '@hugeicons/core-free-icons';

import type { CronoList } from './types';

type CronoIconName = 'add' | 'all' | 'check' | 'completed' | 'delete' | 'inbox' | 'list' | 'more' | 'settings' | 'today';

const icons = {
  add: PlusSignIcon,
  all: ListViewIcon,
  check: CheckIcon,
  completed: CheckmarkCircle02Icon,
  delete: Delete02Icon,
  inbox: InboxIcon,
  list: Folder01Icon,
  more: MoreHorizontalIcon,
  settings: Settings02Icon,
  today: CalendarCheckIcon,
} as const;

export function CronoIcon({
  color = '#111827',
  name,
  size = 18,
  strokeWidth = 1.8,
}: {
  color?: string;
  name: CronoIconName;
  size?: number;
  strokeWidth?: number;
}) {
  return <HugeiconsIcon icon={icons[name]} color={color} size={size} strokeWidth={strokeWidth} />;
}

export function ListIcon({ color, list, size = 18 }: { color: string; list: CronoList; size?: number }) {
  return <CronoIcon color={color} name={getListIconName(list)} size={size} />;
}

function getListIconName(list: CronoList): CronoIconName {
  if (list.kind === 'all') {
    return 'all';
  }
  if (list.kind === 'today') {
    return 'today';
  }
  if (list.kind === 'completed') {
    return 'completed';
  }
  if (list.id === 'inbox') {
    return 'inbox';
  }

  return 'list';
}
