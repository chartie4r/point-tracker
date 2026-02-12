import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import EmptyState from './EmptyState.vue';

describe('EmptyState', () => {
  it('renders title and message', () => {
    const wrapper = mount(EmptyState, {
      props: { title: 'No items', message: 'Add your first item.' },
    });
    expect(wrapper.text()).toContain('No items');
    expect(wrapper.text()).toContain('Add your first item.');
  });

  it('renders action when actionLabel and actionTo are set', () => {
    const wrapper = mount(EmptyState, {
      props: {
        title: 'Empty',
        message: 'Go add one.',
        actionLabel: 'Add',
        actionTo: '/add',
      },
    });
    expect(wrapper.text()).toContain('Add');
    expect(wrapper.find('.mt-4').exists()).toBe(true);
  });
});
