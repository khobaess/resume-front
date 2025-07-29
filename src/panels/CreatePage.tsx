import { FC } from 'react';
import { Button, DateInput, FormItem, FormLayoutGroup, NavIdProps, Panel, PanelHeader, PanelHeaderBack, Placeholder, Select, Textarea} from '@vkontakte/vkui';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import React from 'react';

export const CreatePage: FC<NavIdProps> = ({ id }) => {
  const routeNavigator = useRouteNavigator();

 
  // Состояния для всех полей
  const [name, setName] = React.useState('');
  const [date, setDate] = React.useState<Date | null>(null);
  const [purpose, setPurpose] = React.useState('');
  const [description, setDescription] = React.useState('');

  // Валидация
  const isFormValid = () => {
    return name.trim() !== '' && date !== null && purpose !== '';
  };

  // Обработчик отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) {
      alert('Пожалуйста, заполните все обязательные поля.');
      return;
    }

    const achievementData = {
      name: name.trim(),
      date: date?.toISOString().split('T')[0], // YYYY-MM-DD
      category: purpose,
      description: description.trim(),
    };

    try {
      const response = await fetch('/api/achievements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(achievementData),
      });

      if (response.ok) {
        console.log('Достижение успешно создано');
        routeNavigator.back(); // Вернуться назад после успешного создания
      } else {
        const errorText = await response.text();
        console.error('Ошибка сервера:', errorText);
        alert('Не удалось создать достижение. Попробуйте снова.');
      }
    } catch (error) {
      console.error('Ошибка сети:', error);
      alert('Ошибка подключения. Проверьте интернет.');
    }
  };

  return (
    <Panel id={id}>
      <PanelHeader before={<PanelHeaderBack onClick={() => routeNavigator.back()} />}>
        Добавление нового достижения
      </PanelHeader>
      <FormLayoutGroup onSubmit={handleSubmit}>
        <Placeholder>
          <FormItem
            required
            top="Краткое описание"
          >
            <Textarea
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Создал pet-проект"
              required
            />
          </FormItem>

          <FormItem top="Дата" required>
            <DateInput
              value={date}
              onChange={setDate}
              renderCustomValue={(date) =>
                date ? undefined : (
                  <span aria-hidden style={{ color: 'var(--vkui--color_text_secondary)' }}>
                    Укажите дату
                  </span>
                )
              }
              required
            />
          </FormItem>

          <FormItem
            top="Категория"
            status={purpose ? 'valid' : 'error'}
            required
          >
            <Select
              placeholder="Выберите категорию"
              value={purpose}
              onChange={(_, newValue) => setPurpose(newValue)}
              options={[
                { value: 'study', label: 'Учеба / Работа' },
                { value: 'skills', label: 'Навыки и развитие' },
                { value: 'creativity', label: 'Творчество' },
                { value: 'sport', label: 'Спорт и здоровье' },
                { value: 'social', label: 'Социальная активность' },
                { value: 'personal', label: 'Личные победы' },
                { value: 'travel', label: 'Путешествия и приключения' },
                { value: 'relationships', label: 'Отношения и общение' },
              ]}
              required
            />
          </FormItem>

          <FormItem top="Подробное описание">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Проект создан для ... на тему ..."
            />
          </FormItem>

          <FormItem>
            <Button type="submit" size="l" stretched disabled={!isFormValid()}>
              Создать
            </Button>
          </FormItem>
        </Placeholder>
      </FormLayoutGroup>
    </Panel>
  );
};

