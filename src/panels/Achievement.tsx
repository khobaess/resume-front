import React, { FC, useState, useEffect } from 'react';
import {
  Panel,
  PanelHeader,
  Group,
  Cell,
  Avatar,
  Div,
  Button,
  FormLayoutGroup,
  Input,
  Select,
  Textarea,
  PanelHeaderBack,
  Placeholder,
  FormItem,
  Header,
  Text,
} from '@vkontakte/vkui';
import { useRouteNavigator, useParams } from '@vkontakte/vk-mini-apps-router';
import axios from 'axios';
import { UserInfo } from '@vkontakte/vk-bridge';

const API_URL = import.meta.env.VITE_API_URL;

interface Achievement {
  id: number;
  title: string;
  category: string;
  date: string;
  description: string;
}


const categoryOptions = [
  { value: 'study', label: 'Учеба / Работа' },
  { value: 'skills', label: 'Навыки' },
  { value: 'creativity', label: 'Творчество' },
  { value: 'sport', label: 'Спорт' },
  { value: 'social', label: 'Соц. активность' },
  { value: 'personal', label: 'Личные победы' },
  { value: 'travel', label: 'Путешествия' },
  { value: 'relationships', label: 'Отношения' },
];

export interface AchievementProps {
  id: string;
  fetchedUser: UserInfo;
}

export const Achievement: FC<AchievementProps> = ({ id, fetchedUser }) => {
  const routeNavigator = useRouteNavigator();
  const params = useParams();
  const vkId = fetchedUser?.id;

  const [achievement, setAchievement] = useState<Achievement | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const paramId = params?.id;
  const achievementId = Number(paramId);

  useEffect(() => {
    if (!paramId || isNaN(achievementId)) {
      setError('Неверный ID достижения');
      setLoading(false);
      return;
    }

    if (!vkId) {
      setError('Не удалось получить ID пользователя');
      setLoading(false);
      return;
    }

    const fetchAchievement = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Загрузка достижения:', { achievementId, vkId });

        const response = await axios.get(`${API_URL}/api/achievements/${achievementId}`, {
          params: { userId: vkId },
        });

        const data = response.data;
        setAchievement(data);
        setTitle(data.title);
        setCategory(data.category);
        setDate(data.date);
        setDescription(data.description);
      } catch (err: any) {
        console.error('Ошибка при загрузке достижения:', err);
        setError(
            err.response?.status === 404
                ? 'Достижение не найдено.'
                : err.message.includes('Network Error')
                    ? 'Ошибка сети. Проверьте подключение.'
                    : `Ошибка ${err.response?.status}: не удалось загрузить`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAchievement();
  }, [paramId, vkId]);

  // Обработчики изменения формы
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
      setTitle(e.target.value);
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
      setCategory(e.target.value);
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) =>
      setDate(e.target.value);
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
      setDescription(e.target.value);

  const saveAchievement = async () => {
    if (!vkId) {
      setError('Не удалось получить ID пользователя');
      return;
    }

    try {
      console.log('Отправка PATCH:', {
        id: achievementId,
        title: title,
        category: category,
        date: date,
        description: description,
        user_id: vkId,
    });

      await axios.patch(`${API_URL}/api/achievements/${achievementId}`, {
        title: title,
        category: category,
        date: date,
        description: description,
        user_id: vkId,
      });

      setAchievement({ id: achievementId, title, category, date, description });
      setError(null);

      console.log('Достижение успешно обновлено!');
      await routeNavigator.replace('/achievements');
    } catch (err: any) {
      console.error('Ошибка при сохранении:', err);
      setError(
          err.response?.data?.message ||
          `Ошибка ${err.response?.status}: не удалось обновить`
      );
    }
  };

  const deleteAchievement = async () => {
    try {
      await axios.delete(`${API_URL}/api/achievements/${achievementId}`, {
        params: { userId: vkId },
      });

      routeNavigator.back();
      await routeNavigator.replace('/achievements');
    } catch (err: any) {
      console.error('Ошибка при удалении:', err);
      setError(
          err.response?.data?.message ||
          'Не удалось удалить достижение.'
      );
    }
  };

  return (
      <Panel id={id}>
        <PanelHeader before={<PanelHeaderBack onClick={() => routeNavigator.back()} />}>
          Редактор достижения
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

        {loading && !error && (
            <Placeholder>Загрузка данных...</Placeholder>
        )}

        {!loading && !error && achievement && (
            <Group header={<Header>Редактировать достижение</Header>}>
              <FormLayoutGroup>
                <FormItem top="Название">
                  <Input value={title} onChange={handleTitleChange} placeholder="Например: Сдал экзамен" />
                </FormItem>

                <FormItem top="Категория">
                  <Select
                      value={category}
                      onChange={handleCategoryChange}
                      options={categoryOptions}
                      placeholder="Выберите категорию"
                  />
                </FormItem>

                <FormItem top="Дата">
                  <Input
                      type="date"
                      value={date}
                      onChange={handleDateChange}
                      max={new Date().toISOString().split('T')[0]}
                  />
                </FormItem>

                <FormItem top="Описание">
                  <Textarea
                      value={description}
                      onChange={handleDescriptionChange}
                      placeholder="Расскажите подробнее о достижении..."
                  />
                </FormItem>
              </FormLayoutGroup>

              <Div style={{ marginTop: '16px' }}>
                <Button size="l" stretched mode="primary" onClick={saveAchievement}>
                  Сохранить изменения
                </Button>
                <Button
                    size="l"
                    stretched
                    style={{ marginTop: '8px' }}
                    onClick={deleteAchievement}
                >
                  Удалить достижение
                </Button>
              </Div>
            </Group>
        )}

        {!loading && !error && !achievement && !loading && (
            <Placeholder>
              <Text weight="2">Достижение не найдено</Text>
            </Placeholder>
        )}
      </Panel>
  );
};