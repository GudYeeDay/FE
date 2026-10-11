import { Stack } from 'expo-router'

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#FFFFFF' } }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="email-login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="terms" />
      <Stack.Screen name="find-password" />
    </Stack>
  )
}
