// App.tsx
import { useState, useEffect, ReactNode } from 'react';
import bridge, { UserInfo } from '@vkontakte/vk-bridge';
import { View, SplitLayout, SplitCol, ScreenSpinner } from '@vkontakte/vkui';
import { useActiveVkuiLocation } from '@vkontakte/vk-mini-apps-router';

import { Home, CreatePage, Achievement, AchievementsPage, Awards } from './panels';
import { DEFAULT_VIEW_PANELS } from './routes';

export const App = () => {
  const { panel: activePanel = DEFAULT_VIEW_PANELS.HOME } = useActiveVkuiLocation();
  const [fetchedUser, setFetchedUser] = useState<UserInfo | null>(null);
  const [popout, setPopout] = useState<ReactNode>(<ScreenSpinner />);

  useEffect(() => {
    async function initApp() {
      try {
        const user = await bridge.send('VKWebAppGetUserInfo');
        setFetchedUser(user);
      } catch (error) {
        console.error('Ошибка VKWebAppGetUserInfo:', error);
      } finally {
        setPopout(null);
      }
    }
    initApp();
  }, []);

  return (
      <SplitLayout popout={popout}>
        <SplitCol
            width="100%"
            maxWidth="100%"
            stretchedOnMobile
        >
          <View activePanel={activePanel}>
            <Home id="home" fetchedUser={fetchedUser} />
            <CreatePage id="create" fetchedUser={fetchedUser}/>
            <Achievement id="achievement" fetchedUser={fetchedUser as UserInfo} />
            <AchievementsPage id="achievements" fetchedUser={fetchedUser as UserInfo} />
            <Awards id="awards"  fetchedUser={fetchedUser as UserInfo}/>
          </View>
        </SplitCol>
      </SplitLayout>
  );
};