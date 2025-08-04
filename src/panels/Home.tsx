import { FC, useEffect, useState } from 'react';
import {
    Panel,
    PanelHeader,
    Header,
    Button,
    Group,
    Cell,
    Div,
    Avatar,
} from '@vkontakte/vkui';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import { Icon28AddOutline, Icon28StarsOutline} from '@vkontakte/icons';
import { UserInfo } from '@vkontakte/vk-bridge';

const API_URL = import.meta.env.VITE_API_URL;

export interface HomeProps {
    id: string;
    fetchedUser: UserInfo | null;
}

export const Home: FC<HomeProps> = ({ id, fetchedUser }) => {
    const routeNavigator = useRouteNavigator();
    const [loading, setLoading] = useState(true);

    const vkId = fetchedUser?.id;

    useEffect(() => {
        if (!vkId) return;

        const syncUser = async () => {
            try {
                const existsRes = await fetch(`${API_URL}/api/auth/vk-user/${vkId}/exists`);
                const { exists } = await existsRes.json();

                if (!exists) {
                    await fetch(`${API_URL}/api/auth/vk-user`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            vkId,
                            first_name: fetchedUser.first_name,
                            last_name: fetchedUser.last_name,
                        }),
                    });
                }
            } catch (error) {
                console.error('Ошибка синхронизации:', error);
            } finally {
                setLoading(false);
            }
        };

        syncUser();
    }, [vkId, fetchedUser]);

    if (loading) {
        return (
            <Panel id={id}>
                <PanelHeader>Загрузка...</PanelHeader>
                <Div>Ожидание данных</Div>
            </Panel>
        );
    }

    const { photo_200, first_name, last_name, city } = fetchedUser || {};

    return (
        <Panel id={id}>
            <PanelHeader>Главная</PanelHeader>

            <Group>
                <Cell
                    before={<Avatar size={48} src={photo_200 || 'https://via.placeholder.com/48'} />}
                    subtitle={city?.title || 'Город не указан'}
                >
                    {first_name} {last_name}
                </Cell>
            </Group>

            <Group header={<Header>Ваш прогресс</Header>}>
                <Div>
                    <Button
                        stretched
                        size="l"
                        mode="primary"
                        before={<Icon28AddOutline />}
                        onClick={() => routeNavigator.push('/create')}
                    >
                        Создать достижение
                    </Button>
                </Div>
                <Div>
                    <Button
                        stretched
                        size="l"
                        mode="secondary"
                        before={<Icon28StarsOutline />}
                        onClick={() => routeNavigator.push('/achievements')}
                    >
                        Все достижения
                    </Button>
                </Div>
                <Div>
                    <Button
                        stretched
                        size="l"
                        mode="secondary"
                        onClick={() => routeNavigator.push('/awards')}
                    >
                        Награды и уровень
                    </Button>
                </Div>
            </Group>

            <Div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--text_secondary)' }}>
                Личный дневник достижений • {new Date().getFullYear()}
            </Div>
        </Panel>
    );
};