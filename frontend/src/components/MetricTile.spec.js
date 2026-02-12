import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import MetricTile from './MetricTile.vue';

describe('MetricTile', () => {
  it('renders label and value', () => {
    const wrapper = mount(MetricTile, {
      props: { label: 'Total points', value: 50000 },
    });
    expect(wrapper.text()).toContain('Total points');
    expect(wrapper.text()).toContain('50000');
  });

  it('renders trend badge when trend prop is set', () => {
    const wrapper = mount(MetricTile, {
      props: { value: 100, trend: '+10%' },
    });
    expect(wrapper.text()).toContain('+10%');
  });
});
