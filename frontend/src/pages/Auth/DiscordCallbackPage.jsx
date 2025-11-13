import Loader from '@/components/Loader';
import api from '@/lib/api';
import { useOAuthCallback } from '@/hooks/useOAuthCallback';

const DiscordCallbackPage = () => {
  useOAuthCallback(api.discordLogin, 'Discord');

  return <Loader />;
};

export default DiscordCallbackPage;
