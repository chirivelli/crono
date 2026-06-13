import { Link } from 'expo-router';

import { Pressable, SafeAreaView, ScrollView, Text, View } from '@/tw';

import { CronoIcon } from './crono-icon';

const settingsRows = [
  { label: 'Default list', value: 'Inbox' },
  { label: 'Smart views', value: 'All, Today, Completed' },
  { label: 'Complete delay', value: '3 seconds' },
  { label: 'Notifications', value: 'Task reminders' },
];

export function SettingsPage() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView contentContainerClassName="gap-5 px-5 py-3" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-[34px] font-bold tracking-normal text-gray-900">Settings</Text>
            <Text className="mt-1 text-[15px] text-gray-500">Manage how Crono works for you.</Text>
          </View>
          <View className="h-11 w-11 items-center justify-center rounded-2xl bg-white">
            <CronoIcon name="settings" size={22} />
          </View>
        </View>

        <View className="gap-2">
          {settingsRows.map(row => (
            <View key={row.label} className="min-h-14 flex-row items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3">
              <Text className="flex-1 text-base font-semibold text-gray-900">{row.label}</Text>
              <Text className="text-[15px] font-semibold text-gray-500">{row.value}</Text>
            </View>
          ))}
        </View>

        <View className="gap-3 rounded-lg border border-gray-200 bg-white px-4 py-4">
          <Text className="text-base font-bold text-gray-900">Account</Text>
          <Text className="text-[15px] leading-5 text-gray-500">
            You are using a local Crono profile. Sync and account controls can plug in here when persistence is added.
          </Text>
        </View>

        <Link href="/lists" asChild>
          <Pressable className="min-h-12 flex-row items-center justify-center gap-2 rounded-lg bg-gray-900 px-4">
            <CronoIcon color="#ffffff" name="all" size={18} />
            <Text className="text-[15px] font-bold text-white">Back to lists</Text>
          </Pressable>
        </Link>
      </ScrollView>
    </SafeAreaView>
  );
}
