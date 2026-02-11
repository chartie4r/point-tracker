import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import AvailableCardsList from './AvailableCardsList.vue';
import { CARD_FIXTURES } from '../../../test/cardFixtures.js';

const mockCards = CARD_FIXTURES.slice(0, 5);

vi.mock('../api/client', () => ({
  getAvailableCards: vi.fn(() => Promise.resolve({ cards: mockCards, lastRefreshedAt: null })),
  scrapeMilesopedia: vi.fn(),
  refreshAvailableCard: vi.fn(),
}));

vi.mock('../composables/useAuth', () => ({
  useAuth: () => ({ isSuperadmin: false }),
}));

async function createWrapper() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/available-cards', name: 'AvailableCards', component: AvailableCardsList },
      { path: '/cards/new', name: 'CardNew', component: { template: '<div/>' } },
    ],
  });
  await router.push('/available-cards');
  return mount(AvailableCardsList, {
    global: {
      plugins: [router],
      stubs: { CardNetworkLogo: true },
      mocks: {
        $t: (key) => key,
        $i18n: { locale: 'en' },
      },
    },
  });
}

describe('AvailableCardsList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads and displays cards from API', async () => {
    const wrapper = await createWrapper();
    await flushPromises();
    const list = wrapper.findAll('li');
    expect(list).toHaveLength(5);
  });

  it('displays card names from fixtures', async () => {
    const wrapper = await createWrapper();
    await flushPromises();
    expect(wrapper.text()).toContain(mockCards[0].cardName);
    expect(wrapper.text()).toContain(mockCards[mockCards.length - 1].cardName);
  });

  it('shows filter controls', async () => {
    const wrapper = await createWrapper();
    await flushPromises();
    const selects = wrapper.findAll('select');
    expect(selects.length).toBeGreaterThanOrEqual(3);
  });
});
