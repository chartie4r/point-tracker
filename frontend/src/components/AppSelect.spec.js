import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import AppSelect from './AppSelect.vue';

describe('AppSelect', () => {
  it('renders options from options prop', () => {
    const wrapper = mount(AppSelect, {
      props: {
        modelValue: '',
        options: [
          { value: 'a', label: 'Option A' },
          { value: 'b', label: 'Option B' },
        ],
        placeholder: 'Choose',
      },
    });
    const options = wrapper.findAll('option');
    expect(options).toHaveLength(3);
    expect(options[0].text()).toBe('Choose');
    expect(options[1].text()).toBe('Option A');
    expect(options[2].text()).toBe('Option B');
  });

  it('emits update:modelValue on change', async () => {
    const wrapper = mount(AppSelect, {
      props: {
        modelValue: '',
        options: [{ value: 'x', label: 'X' }],
      },
    });
    await wrapper.find('select').setValue('x');
    expect(wrapper.emitted('update:modelValue')).toEqual([['x']]);
  });
});
