import { Redirect } from 'expo-router';
import { useAuth } from '../hooks/useAuth';

export default function Index() {
  const { isAuth, user, loading } = useAuth();

  if (loading) return null; // SecureStore okunana kadar bekle

  // Tam kapı: giriş yapmış ama e-postası doğrulanmamış hesap → doğrulama ekranı.
  // (Misafirler ve doğrulanmış kullanıcılar serbest.)
  if (isAuth && user && user.is_email_verified === false) {
    return <Redirect href="/(auth)/eposta-dogrula" />;
  }

  return <Redirect href="/(tabs)/haberler" />;
}
