import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '../../context/AuthContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { role } = useAuth();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: { position: 'absolute' },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home" color={color} size={26} />,
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: 'Sản phẩm',
          tabBarIcon: ({ color }) => <Ionicons name="bag-handle" color={color} size={26} />,
        }}
      />
      <Tabs.Screen
        name="Cart"
        options={{
          title: 'Giỏ hàng',
          tabBarIcon: ({ color }) => <Ionicons name="cart-outline" color={color} size={26} />,
        }}
      />
      {role === 'admin' && (
        <Tabs.Screen
          name="DeliveryAdmin"
          options={{
            title: 'Đơn hàng',
            tabBarIcon: ({ color }) => <Ionicons name="clipboard-list" color={color} size={26} />,
          }}
        />
      )}
      <Tabs.Screen
        name="Gallery"
        options={{
          title: 'Gallery',
          tabBarIcon: ({ color }) => <Ionicons name="images-outline" color={color} size={26} />,
        }}
      />
      <Tabs.Screen
        name="MapScreen"
        options={{
          title: 'Live Map',
          tabBarIcon: ({ color }) => <Ionicons name="map-outline" color={color} size={26} />,
        }}
      />
      <Tabs.Screen
        name="AccountInfo"
        options={{
          title: 'Tài khoản',
          tabBarIcon: ({ color }) => <Ionicons name="person-circle-outline" color={color} size={26} />,
        }}
      />
    </Tabs>
  );
}
