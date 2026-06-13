import { usePathname } from 'expo-router';

import { Link, Pressable, Text, View } from '@/tw';

import { CronoIcon } from './crono-icon';

const items = [
  { href: '/lists', icon: 'all', label: 'Lists' },
  { href: '/lists/today', icon: 'today', label: 'Today' },
  { href: '/settings', icon: 'settings', label: 'Settings' },
] as const;

export function MobileNavigationBar() {
  const pathname = usePathname();

  return (
    <View className="items-center px-5 pb-5 pt-2">
      <View className="w-full max-w-[420px] flex-row items-center justify-around rounded-2xl border border-gray-200 bg-white px-3 py-2">
        {items.map(item => {
          const active = item.href === '/lists' ? pathname === '/' || pathname.startsWith('/lists') : pathname === item.href;

          return (
            <Link key={item.href} href={item.href} asChild>
              <Pressable className="min-w-20 items-center gap-1 rounded-xl px-3 py-2">
                <CronoIcon color={active ? '#111827' : '#9ca3af'} name={item.icon} size={22} strokeWidth={active ? 2 : 1.7} />
                <Text className={active ? 'text-[12px] font-bold text-gray-900' : 'text-[12px] font-semibold text-gray-400'}>
                  {item.label}
                </Text>
              </Pressable>
            </Link>
          );
        })}
      </View>
    </View>
  );
}
