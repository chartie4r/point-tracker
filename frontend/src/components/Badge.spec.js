import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Badge from './Badge.vue';

describe('Badge', () => {
  it('renders slot content', () => {
    const wrapper = mount(Badge, { slots: { default: '+12%' } });
    expect(wrapper.text()).toBe('+12%');
  });

  it('applies neutral variant by default', () => {
    const wrapper = mount(Badge, { slots: { default: 'x' } });
    expect(wrapper.classes()).toContain('bg-slate-100');
  });

  it('applies success variant when specified', () => {
    const wrapper = mount(Badge, {
      props: { variant: 'success' },
      slots: { default: 'Done' },
    });
    expect(wrapper.classes()).toContain('bg-emerald-100');
  });
});
