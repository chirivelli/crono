import { usePathname } from 'expo-router';

import { Link, Pressable, Text, View } from '@/tw';

import { CronoIcon } from './crono-icon';

const items = [
  { href: '/lists', icon: 'all', label: 'Lists' },
  { href: '/lists/today', icon: 'today', label: 'Today' },
  { href: '/settings', icon: 'settings', label: 'Settings' },
] as const;

function isActiveRoute(href: (typeof items)[number]['href'], pathname: string) {
  if (href === '/lists') {
    return pathname === '/' || pathname === '/lists' || (pathname.startsWith('/lists/') && pathname !== '/lists/today');
  }

  return pathname === href;
}

export function MobileNavigationBar() {
  const pathname = usePathname();

  return (
    <View className="border-t border-gray-200 bg-white px-4 pb-4 pt-2">
      <View className="flex-row items-center justify-around">
        {items.map(item => {
          const active = isActiveRoute(item.href, pathname);

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
