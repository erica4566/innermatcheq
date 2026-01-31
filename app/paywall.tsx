import { useRouter } from 'expo-router';
import Paywall from '@/components/Paywall';
import { useAppStore } from '@/lib/store';

export default function PaywallScreen() {
  const router = useRouter();
  const updateCurrentUser = useAppStore((s) => s.updateCurrentUser);

  const handleClose = () => {
    router.back();
  };

  const handleSubscribe = (tier: 'plus' | 'premium' | 'elite') => {
    // In a real app, this would handle payment through RevenueCat
    updateCurrentUser({
      isPremium: true,
      premiumTier: tier,
    });
    router.back();
  };

  return <Paywall onClose={handleClose} onSubscribe={handleSubscribe} />;
}
