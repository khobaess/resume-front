import { FC, useEffect, useState } from 'react';
import {
  Panel,
  PanelHeader,
  Header,
  Group,
  Cell,
  Avatar,
  Badge,
  Spinner,
  Placeholder,
  SegmentedControl,
  Div,
  Button,
  PanelHeaderBack,
} from '@vkontakte/vkui';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import { Icon56CancelCircleOutline, Icon56UserCircleOutline } from '@vkontakte/icons';

interface Achievement {
  id: number;
  name: string;
  description: string;
  category: string;
  date: string; // YYYY-MM-DD
}

const CATEGORY_LABELS: Record<string, string> = {
  study: 'Учеба / Работа',
  skills: 'Навыки',
  creativity: 'Творчество',
  sport: 'Спорт',
  social: 'Соц. активность',
  personal: 'Личные победы',
  travel: 'Путешествия',
  relationships: 'Отношения',
};

const ALL_CATEGORIES = [
  { value: 'all', label: 'Все' },
  { value: 'study', label: 'Учеба' },
  { value: 'skills', label: 'Навыки' },
  { value: 'creativity', label: 'Творчество' },
  { value: 'sport', label: 'Спорт' },
  { value: 'social', label: 'Соц. активность' },
  { value: 'personal', label: 'Победы' },
  { value: 'travel', label: 'Путешествия' },
  { value: 'relationships', label: 'Отношения' },
];

export const AchievementsPage: FC<{ id: string }> = ({ id }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const routeNavigator = useRouteNavigator();

  // Загрузка достижений с бэкенда с фильтром
  const loadAchievements = async (category: string) => {
    setLoading(true);
    setError(null);
    try {
      let url = '/api/achievements';
      const params = new URLSearchParams();

      if (category !== 'all') {
        params.append('category', category);
      }

      if (params.toString()) {
        url += '?' + params.toString();
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Ошибка ${response.status}`);
      }

      const data: Achievement[] = await response.json();
      setAchievements(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  };

  // Загружаем при изменении фильтра
  useEffect(() => {
    loadAchievements(filter);
  }, [filter]);

  return (
    <Panel id={id}>
      <PanelHeader before={<PanelHeaderBack onClick={() => routeNavigator.back()} />}>Достижения</PanelHeader>

      <Group header={<Header mode="secondary">Фильтр</Header>}>
        <Div>
          <SegmentedControl
            value={filter}
            onChange={(value) => setFilter(value)}
            options={ALL_CATEGORIES}
          />
        </Div>
      </Group>

      <Group>
        {loading ? (
          <Div>
            <Spinner size="l" style={{ display: 'flex', justifyContent: 'center' }} />
          </Div>
        ) : error ? (
          <Placeholder
            icon={<Icon56CancelCircleOutline />}
            header="Ошибка загрузки"
            action={
              <Button size="m" mode="secondary" onClick={() => loadAchievements(filter)}>
                Повторить
              </Button>
            }
          >
            <span style={{ color: 'var(--vkui--color_text_secondary)' }}>
              {error.includes('network')
                ? 'Проверьте интернет-соединение.'
                : 'Не удалось загрузить данные. Попробуйте снова.'}
            </span>
          </Placeholder>
        ) : achievements.length === 0 ? (
          <Placeholder
            icon={<Icon56UserCircleOutline />}
            header={filter === 'all' ? 'Нет достижений' : 'Нет в категории'}
            action={
              <Button size="m" onClick={() => routeNavigator.push('/create_page')}>
                {filter === 'all' ? 'Создать первое' : 'Добавить сюда'}
              </Button>
            }
          >
            {filter === 'all'
              ? 'Начните отмечать свои успехи!'
              : `В категории «${CATEGORY_LABELS[filter] || filter}» пока пусто.`}
          </Placeholder>
        ) : (
          achievements.map((ach) => (
            <Cell
              key={ach.id}
              before={<Avatar>{ach.name[0]}</Avatar>}
              asideContent={
                <Badge mode="prominent">
                  {CATEGORY_LABELS[ach.category] || ach.category}
                </Badge>
              }
              description={new Date(ach.date).toLocaleDateString('ru-RU')}
              onClick={() => routeNavigator.push(`/achievement/${ach.id}`)}
            >
              {ach.name}
            </Cell>
          ))
        )}
      </Group>
    </Panel>
  );
};