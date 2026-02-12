import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import AppButton from './AppButton.vue';

describe('AppButton', () => {
  it('renders a button by default with slot content', () => {
    const wrapper = mount(AppButton, {
      slots: { default: 'Click me' },
    });
    expect(wrapper.element.tagName).toBe('BUTTON');
    expect(wrapper.text()).toBe('Click me');
  });

  it('renders router-link when to is provided', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { template: '<div/>' } },
        { path: '/cards', component: { template: '<div/>' } },
      ],
    });
    await router.push('/');
    const wrapper = mount(AppButton, {
      props: { to: '/cards' },
      slots: { default: 'My cards' },
      global: { plugins: [router] },
    });
    expect(wrapper.find('a').exists()).toBe(true);
    expect(wrapper.text()).toBe('My cards');
  });

  it('applies primary variant classes', () => {
    const wrapper = mount(AppButton, {
      props: { variant: 'primary' },
      slots: { default: 'Save' },
    });
    expect(wrapper.classes()).toContain('border-violet-500');
    expect(wrapper.classes()).toContain('bg-violet-500');
  });
});
