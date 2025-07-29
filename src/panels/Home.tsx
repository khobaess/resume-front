import { FC, useEffect } from 'react';
import {
  Panel,
  PanelHeader,
  Header,
  Button,
  Group,
  Cell,
  Div,
  Avatar,
  NavIdProps,
  Spinner,
} from '@vkontakte/vkui';
import { UserInfo } from '@vkontakte/vk-bridge';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import React from 'react';

export interface HomeProps extends NavIdProps {
  fetchedUser?: UserInfo;
}

export const Home: FC<HomeProps> = ({ id, fetchedUser }) => {
  const { photo_200, city, first_name, last_name } = { ...fetchedUser };
  const routeNavigator = useRouteNavigator();
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    if (fetchedUser) {
      const sendDataToBackend = async () => {
        setLoading(true);
        try {
          const response = await fetch('/api/auth/vk-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              vkId: fetchedUser.id,
              firstName: fetchedUser.first_name,
              lastName: fetchedUser.last_name,
              city: fetchedUser.city?.title || null,
              avatar: fetchedUser.photo_200 || null,
            }),
          });

          if (!response.ok) {
            console.error('Ошибка при отправке данных:', await response.text());
          } else {
            console.log('Данные пользователя успешно отправлены');
          }
        } catch (error) {
          console.error('Ошибка сети:', error);
        } finally {
          setLoading(false);
        }
      };

      sendDataToBackend();
    }
  }, [fetchedUser]);

  if (loading) {
    return (
      <Panel id={id}>
        <PanelHeader>Главная</PanelHeader>
        <Div>
          <Spinner size="l" />
        </Div>
      </Panel>
    );
  }

  return (
    <Panel id={id}>
      <PanelHeader>Главная</PanelHeader>

      {fetchedUser && (
        <Group>
          <Cell
            before={<Avatar src={photo_200} />}
            subtitle={city?.title}
          >
            {`${first_name} ${last_name}`}
          </Cell>
        </Group>
      )}

      <Group header={<Header size="s">Меню</Header>}>
        <Div>
          <Button
            stretched
            size="l"
            mode="secondary"
            onClick={() => routeNavigator.push('create_page')}
          >
            создать достижение
          </Button>
        </Div>
        <Div>
          <Button
            stretched
            size="l"
            mode="secondary"
            onClick={() => routeNavigator.push('achievements_page')}
          >
            все достижения
          </Button>
        </Div>
        <Div>
          <Button
            stretched
            size="l"
            mode="secondary"
            onClick={() => routeNavigator.push('achievement')}
          >
            ачивки
          </Button>
        </Div>
      </Group>
    </Panel>
  );
};
