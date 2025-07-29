import {
  createHashRouter,
  createPanel,
  createRoot,
  createView,
  RoutesConfig,
} from '@vkontakte/vk-mini-apps-router';

export const DEFAULT_ROOT = 'default_root';

export const DEFAULT_VIEW = 'default_view';
export const DEFAULT_VIEW_PANELS = {
  HOME: 'home',
  CREATE_PAGE: 'create_page',
  ACHIEVEMENT: 'achievement',
  ACHIEVEMENTS_PAGE: 'achievements_page',
} as const;

export const routes = RoutesConfig.create([
  createRoot(DEFAULT_ROOT, [
    createView(DEFAULT_VIEW, [
      createPanel(DEFAULT_VIEW_PANELS.HOME, '/', []),
      createPanel(DEFAULT_VIEW_PANELS.CREATE_PAGE, `/${DEFAULT_VIEW_PANELS.CREATE_PAGE}`, []),
      createPanel(DEFAULT_VIEW_PANELS.ACHIEVEMENT, `/${DEFAULT_VIEW_PANELS.ACHIEVEMENT}`, []),
      createPanel(DEFAULT_VIEW_PANELS.ACHIEVEMENTS_PAGE, `/${DEFAULT_VIEW_PANELS.ACHIEVEMENTS_PAGE}`, []),
    ]),
  ]),
]);

export const router = createHashRouter(routes.getRoutes());
