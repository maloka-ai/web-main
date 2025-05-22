import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Componentes/Button',
  component: Button,
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Padrão: Story = {
  args: {
    label: 'Clique aqui',
  },
};
