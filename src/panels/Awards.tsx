import { FC, useState, useEffect } from 'react';
import {
    Panel,
    PanelHeader,
    Group,
    Cell,
    Avatar,
    Placeholder,
    List,
    Div,
    Text,
    Button,
    Header, PanelHeaderBack,
} from '@vkontakte/vkui';
import { UserInfo } from '@vkontakte/vk-bridge';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const categories = [
    { value: 'study', label: 'Учеба / Работа' },
    { value: 'skills', label: 'Навыки и развитие' },
    { value: 'creativity', label: 'Творчество' },
    { value: 'sport', label: 'Спорт и здоровье' },
    { value: 'social', label: 'Социальная активность' },
    { value: 'personal', label: 'Личные победы' },
    { value: 'travel', label: 'Путешествия и приключения' },
    { value: 'relationships', label: 'Отношения и общение' },
] as const;

const getCategoryLabel = (value: string): string => {
    const category = categories.find(cat => cat.value === value);
    return category ? category.label : 'Неизвестная категория';
};

export interface AwardsProps {
    id: string;
    fetchedUser: UserInfo;
}

export const Awards: FC<AwardsProps> = ({ id, fetchedUser }) => {
    const routeNavigator = useRouteNavigator();
    const vkId = fetchedUser?.id;

    const [awards, setAwards] = useState<{
        title: string;
        category: string;
        date: string;
    }[]>([]);
    const [stats, setStats] = useState<{
        achievementsCount: number;
        mostActiveCategory: string;
        awardsCount: number;
        level: number;
        firstName: string;
    } | null>(null);
    const [level, setLevel] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!vkId) {
            setError('Не удалось получить идентификатор пользователя');
            setLoading(false);
            return;
        }

        setError(null);
        setLoading(true);

        Promise.all([
            axios.get(`${API_URL}/api/awards?userId=${vkId}`).then(res => setAwards(res.data || [])),
            axios.get(`${API_URL}/api/awards/stats?userId=${vkId}`).then(res => setStats(res.data)),
            axios.get(`${API_URL}/api/awards/level?userId=${vkId}`).then(res => setLevel(res.data.level || 1)),
        ])
            .catch(err => {
                console.error('Ошибка при загрузке данных:', err);
                setError('Не удалось загрузить данные. Проверьте соединение.');
            })
            .finally(() => {
                setLoading(false);
            });
    }, [vkId]);

    return (
        <Panel id={id}>
            <PanelHeader before={<PanelHeaderBack onClick={() => routeNavigator.back()} />}>
                Награды
            </PanelHeader>

            {fetchedUser && (
                <Group>
                    <Cell
                        before={<Avatar src={fetchedUser.photo_200} />}
                        subtitle={fetchedUser.city?.title || 'Город не указан'}
                    >
                        {fetchedUser.first_name} {fetchedUser.last_name}
                    </Cell>
                </Group>
            )}

            {error && (
                <Placeholder>
                    <Text weight="2" style={{ color: 'var(--vkui--color_text_negative)' }}>
                        {error}
                    </Text>
                </Placeholder>
            )}

            {!error && stats && (
                <Group header={<Header>Ваш прогресс</Header>}>
                    <Div>
                        <Text weight="2">Достижений:</Text> <Text>{stats.achievementsCount}</Text>
                    </Div>
                    <Div>
                        <Text weight="2">Самая популярная категория:</Text>{' '}
                        <Text>{getCategoryLabel(stats.mostActiveCategory)}</Text>
                    </Div>
                    <Div>
                        <Text weight="2">Наград:</Text> <Text>{stats.awardsCount}</Text>
                    </Div>
                    <Div>
                        <Text weight="2">Уровень:</Text> <Text>{level}/10</Text>
                    </Div>
                </Group>
            )}

            {!error && awards.length > 0 && (
                <Group header={<Header>Ваши награды</Header>}>
                    <List>
                        {awards.map((award, index) => (
                            <Cell key={index}>
                                {award.title}
                            </Cell>
                        ))}
                    </List>
                </Group>
            )}

            {!error && awards.length === 0 && !loading && (
                <Placeholder title="Ещё нет наград">
                    <Text>Создавайте достижения — и получайте награды!</Text>
                    <Button
                        size="l"
                        mode="primary"
                        stretched
                        style={{ marginTop: 8 }}
                        onClick={() => routeNavigator.push('/create')}
                    >
                        Создать достижение
                    </Button>
                </Placeholder>
            )}
        </Panel>
    );
};