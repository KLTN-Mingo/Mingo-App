import { Redirect } from 'expo-router';

/**
 * Route gốc "/" - chuyển thẳng vào (tabs).
 * AuthProvider sẽ redirect sang (auth)/signin nếu chưa đăng nhập.
 */
export default function Index() {
  return <Redirect href="/(tabs)/home" />;
}
