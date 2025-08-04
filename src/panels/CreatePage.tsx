import {
    Panel,
    PanelHeader,
    Header,
    Button,
    Group,
    Input,
    Select,
    Div,
    Textarea,
    PanelHeaderBack,
    FormItem, Cell, Avatar,
} from '@vkontakte/vkui';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import { UserInfo } from '@vkontakte/vk-bridge';
import React, {FC, useState} from "react";

const API_URL = import.meta.env.VITE_API_URL;

export interface CreateProps {
    id: string;
    fetchedUser: UserInfo | null;
}

const categories = [
    { value: 'study', label: 'Учеба / Работа' },
    { value: 'skills', label: 'Навыки и развитие' },
    { value: 'creativity', label: 'Творчество' },
    { value: 'sport', label: 'Спорт и здоровье' },
    { value: 'social', label: 'Социальная активность' },
    { value: 'personal', label: 'Личные победы' },
    { value: 'travel', label: 'Путешествия и приключения' },
    { value: 'relationships', label: 'Отношения и общение' },
];

export const CreatePage: FC<CreateProps> = ({ id, fetchedUser }) => {
    const routeNavigator = useRouteNavigator();

    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const vkId = fetchedUser?.id;

    const { photo_200, first_name, last_name, city } = fetchedUser || {};


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Форма отправлена!');

        if (!vkId) {
            setError('Не удалось получить идентификатор пользователя');
            return;
        }
        if (!title.trim()) {
            setError('Введите заголовок достижения');
            return;
        }
        if (!category) {
            setError('Выберите категорию');
            return;
        }
        if (!date) {
            setError('Выберите дату');
            return;
        }
        if (!description.trim()) {
            setError('Введите описание достижения');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/api/achievements`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title.trim(),
                    category: category,
                    date: date,
                    description: description.trim(),
                    user_id: vkId,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                new Error(data.message || `Ошибка сервера: ${response.status}`);
            }

            console.log('Достижение успешно создано! Переход на главную...');
            await routeNavigator.replace('/');
        } catch (err: any) {
            console.error('Ошибка при создании достижения:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Panel id={id}>
            <PanelHeader before={<PanelHeaderBack onClick={() => routeNavigator.back()} />}>
                Создать достижение
            </PanelHeader>

            <Group>
                <Cell
                    before={<Avatar size={48} src={photo_200 || 'https://via.placeholder.com/48'} />}
                    subtitle={city?.title || 'Город не указан'}
                >
                    {first_name} {last_name}
                </Cell>
            </Group>

            <Group header={<Header>Заполните данные</Header>}>
                <form onSubmit={handleSubmit}>
                        <FormItem
                            top="Название"
                            status={error && !title.trim() ? 'error' : undefined}
                        >
                            <Input
                                placeholder="Например: Сдал экзамен по математике"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </FormItem>

                        <FormItem
                            top="Категория"
                            status={error && !category ? 'error' : undefined}
                        >
                            <Select placeholder="Выберите категорию"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            options={categories}
                            />
                        </FormItem>

                        <FormItem
                            top="Дата достижения"
                            status={error && !date ? 'error' : undefined}
                        >
                            <Input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                max={new Date().toISOString().split('T')[0]}
                            />
                        </FormItem>

                        <FormItem
                            top="Описание"
                            status={error && !description.trim() ? 'error' : undefined}
                        >
                            <Textarea
                                placeholder="Расскажите, что именно вы сделали и почему это важно..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </FormItem>

                        <Div>
                            <Button
                                size="l"
                                stretched
                                mode="primary"
                                type="submit"
                                loading={loading}
                                disabled={loading}
                            >
                                Создать достижение
                            </Button>
                        </Div>

                        {error && (
                            <Div style={{ color: 'var(--vkui--color_text_negative)', fontSize: 14 }}>
                                {error}
                            </Div>
                        )}
                </form>
            </Group>
        </Panel>
    );
};