import { FC } from 'react';
import {
  Panel,
  PanelHeader,
  //Header,
  //Button,
  Group,
  Cell,
  //Div,
  Avatar,
  NavIdProps,
  PanelHeaderBack,
  Placeholder,
} from '@vkontakte/vkui';
import { UserInfo } from '@vkontakte/vk-bridge';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';

export interface HomeProps extends NavIdProps {
  fetchedUser?: UserInfo;
}

export const Achievement: FC<HomeProps> = ({ id, fetchedUser }) => {
  const { photo_200, city, first_name, last_name } = { ...fetchedUser };
  const routeNavigator = useRouteNavigator();

  return (
    <Panel id={id}>
      <PanelHeader before={<PanelHeaderBack onClick={() => routeNavigator.back()} />}>Ачивки</PanelHeader>
      {fetchedUser && (
        <Group>
          <Cell before={photo_200 && <Avatar src={photo_200} />} subtitle={city?.title}>
            {`${first_name} ${last_name}`}
          </Cell>
        </Group>
      )}
      <Placeholder>
        тут список всех полученных ачивок
      </Placeholder>
    </Panel>
  );
};
