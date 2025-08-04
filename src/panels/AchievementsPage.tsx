import { FC, useState, useEffect } from 'react';
import {
  Panel,
  PanelHeader,
  Header,
  Group,
  Cell,
  Badge,
  Placeholder,
  SegmentedControl,
  SegmentedControlValue,
  Div,
  Button,
  PanelHeaderBack, Select, usePlatform, Platform,
} from '@vkontakte/vkui';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import axios from 'axios';
import { Icon56CancelCircleOutline, Icon56UserCircleOutline } from '@vkontakte/icons';
import { UserInfo } from '@vkontakte/vk-bridge';

const API_URL = import.meta.env.VITE_API_URL;

interface Achievement {
  id: number;
  title: string;
  category: string;
  date: string;
  description: string;
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
  { value: 'study', label: 'Учеба / Работа' },
  { value: 'skills', label: 'Навыки' },
  { value: 'creativity', label: 'Творчество' },
  { value: 'sport', label: 'Спорт' },
  { value: 'social', label: 'Соц. активность' },
  { value: 'personal', label: 'Личные победы' },
  { value: 'travel', label: 'Путешествия' },
  { value: 'relationships', label: 'Отношения' },
];

export interface AchievementsPageProps {
  id: string;
  fetchedUser: UserInfo;
}

export const AchievementsPage: FC<AchievementsPageProps> = ({ id, fetchedUser }) => {
  const routeNavigator = useRouteNavigator();
  const vkId = fetchedUser?.id;

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [paginationInfo, setPaginationInfo] = useState<{
    totalPages: number;
    totalElements: number;
  }>({ totalPages: 0, totalElements: 0 });

  const platform = usePlatform();
  const isMobile = platform === Platform.IOS || platform === Platform.ANDROID;

  useEffect(() => {
    if (!vkId) {
      setError('Не удалось получить ID пользователя');
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadAchievements = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`${API_URL}/api/achievements`, {
          params: {
            userId: vkId,
            category: filter === 'all' ? undefined : filter,
            page: currentPage,
            size: pageSize,
          },
        });

        console.log('API Response:', response.data);
        if (cancelled) return;

        const data = response.data;
        setAchievements(Array.isArray(data.content) ? data.content : []);
        setPaginationInfo({
          totalPages: data.totalPages || 0,
          totalElements: data.totalElements || 0,
        });
      } catch (err: any) {
        if (cancelled) return;
        setError(
            err.message.includes('Network Error')
                ? 'Ошибка сети. Проверьте подключение.'
                : 'Не удалось загрузить достижения.'
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadAchievements();

    return () => {
      cancelled = true;
    };
  }, [filter, currentPage, vkId, pageSize]);

  const handleFilterChange = (value: SegmentedControlValue) => {
    if (typeof value !== 'string') return;
    setFilter(value);
  };

  return (
      <Panel id={id}>
        <PanelHeader before={<PanelHeaderBack onClick={() => routeNavigator.back()} />}>
          Достижения
        </PanelHeader>

        <Group header={<Header >Фильтр</Header>}>
          <Div>
            {isMobile ? (
                <Select
                    title="Категория"
                    placeholder="Выберите категорию"
                    value={filter}
                    onChange={(e) => handleFilterChange(e.target.value)}
                    options={ALL_CATEGORIES}
                    style={{ width: '100%' }}
                />
            ) : (
                <SegmentedControl
                    value={filter}
                    onChange={handleFilterChange}
                    options={ALL_CATEGORIES}
                    style={{ justifyContent: 'center' }}
                />
            )}
          </Div>
        </Group>

        {paginationInfo.totalElements > 0 && (
            <Group>
              <Div style={{ textAlign: 'center', marginBottom: '8px' }}>
                Найдено: {paginationInfo.totalElements}
              </Div>
            </Group>
        )}

        <Group>
          {loading ? (
              <Div style={{ textAlign: 'center', padding: '24px' }}>Загрузка...</Div>
          ) : error ? (
              <Placeholder
                  icon={<Icon56CancelCircleOutline />}
                  title="Ошибка загрузки"
                  action={
                    <Button size="m" onClick={() => setCurrentPage(currentPage)}>
                      Повторить
                    </Button>
                  }
              >
                <span style={{ color: 'var(--vkui--color_text_secondary)' }}>{error}</span>
              </Placeholder>
          ) : achievements.length === 0 ? (
              <Placeholder
                  icon={<Icon56UserCircleOutline />}
                  title={filter === 'all' ? 'Нет достижений' : 'Нет в категории'}
                  action={
                    <Button size="m" onClick={() => routeNavigator.push('/create')}>
                      {filter === 'all'
                          ? 'Создать первое'
                          : `Добавить в «${CATEGORY_LABELS[filter] || filter}»`}
                    </Button>
                  }
              >
                {filter === 'all'
                    ? 'Начните отмечать свои успехи!'
                    : `В категории «${CATEGORY_LABELS[filter] || filter}» пока пусто.`}
              </Placeholder>
          ) : (
              achievements.map((ach) => {
                return (
                    <Cell
                        key={ach.id}
                        after={
                          <Badge mode="prominent">
                            {CATEGORY_LABELS[ach.category] || ach.category}
                          </Badge>
                        }
                        subtitle={new Date(ach.date).toLocaleDateString('ru-RU')}
                        onClick={() => routeNavigator.push(`/achievement/${ach.id}`)}
                    >
                      {ach.title}
                    </Cell>
                );
              })
          )}
        </Group>

        {paginationInfo.totalPages > 1 && (
            <Group>
              <Div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                    size="l"
                    mode="secondary"
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Предыдущая
                </Button>
                <span>Страница {currentPage + 1}</span>
                <Button
                    size="l"
                    mode="secondary"
                    disabled={currentPage >= paginationInfo.totalPages - 1}
                    onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Следующая
                </Button>
              </Div>
            </Group>
        )}
      </Panel>
  );
};