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
  CREATE_PAGE: 'create',
  ACHIEVEMENT: 'achievement',
  ACHIEVEMENTS_PAGE: 'achievements',
  AWARDS: 'awards',
} as const;

export const routes = RoutesConfig.create([
  createRoot(DEFAULT_ROOT, [
    createView(DEFAULT_VIEW, [
      createPanel(DEFAULT_VIEW_PANELS.HOME, '/', []),
      createPanel(DEFAULT_VIEW_PANELS.CREATE_PAGE, '/create', []),
      createPanel(DEFAULT_VIEW_PANELS.ACHIEVEMENT, '/achievement/:id', []),
      createPanel(DEFAULT_VIEW_PANELS.ACHIEVEMENTS_PAGE, '/achievements', []),
      createPanel(DEFAULT_VIEW_PANELS.AWARDS, '/awards', []),
    ]),
  ]),
]);

export const router = createHashRouter(routes.getRoutes());