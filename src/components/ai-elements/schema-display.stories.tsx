import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import {
  SchemaDisplay,
  type SchemaDisplayParameterValue,
  type SchemaDisplayPropertyValue,
} from './schema-display';

const userParameters: SchemaDisplayParameterValue[] = [
  {
    name: 'id',
    type: 'string',
    required: true,
    location: 'path',
    description: 'Unique identifier of the user record.',
  },
  {
    name: 'include',
    type: 'string[]',
    location: 'query',
    description: 'Comma-separated list of relations to expand (e.g. "profile,teams").',
  },
];

const userResponse: SchemaDisplayPropertyValue[] = [
  { name: 'id', type: 'string', required: true, description: 'Stable user id.' },
  { name: 'email', type: 'string', required: true },
  {
    name: 'profile',
    type: 'object',
    properties: [
      { name: 'displayName', type: 'string' },
      { name: 'avatarUrl', type: 'string', description: 'HTTPS URL or empty string.' },
    ],
  },
  {
    name: 'teams',
    type: 'object[]',
    items: {
      name: 'team',
      type: 'object',
      properties: [
        { name: 'id', type: 'string', required: true },
        { name: 'role', type: '"owner" | "admin" | "member"', required: true },
      ],
    },
  },
];

const createUserBody: SchemaDisplayPropertyValue[] = [
  {
    name: 'email',
    type: 'string',
    required: true,
    description: 'Must be a valid RFC 5322 address.',
  },
  { name: 'displayName', type: 'string', required: true },
  {
    name: 'inviteToTeamId',
    type: 'string',
    description: 'Optional team to invite the new user to.',
  },
];

const meta = {
  title: 'AI Elements/Schema Display',
  component: SchemaDisplay,
} satisfies Meta<typeof SchemaDisplay>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    method: 'GET',
    path: '/api/v1/users/{id}',
    description: 'Fetch a single user by id, optionally expanding related resources.',
    parameters: userParameters,
    responseBody: userResponse,
  },
  render: (args) => (
    <div style={{ width: 560 }}>
      <SchemaDisplay {...args} />
    </div>
  ),
};

export const VariantMatrix: Story = {
  args: { method: 'GET', path: '/' },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: 560 }}>
      <SchemaDisplay method="GET" path="/api/v1/users/{id}" />
      <SchemaDisplay method="POST" path="/api/v1/users" />
      <SchemaDisplay method="PUT" path="/api/v1/users/{id}" />
      <SchemaDisplay method="PATCH" path="/api/v1/users/{id}" />
      <SchemaDisplay method="DELETE" path="/api/v1/users/{id}" />
    </div>
  ),
};

export const Docs: Story = {
  args: {
    method: 'POST',
    path: '/api/v1/users',
    description: 'Create a new user account and, optionally, invite them to a team.',
    requestBody: createUserBody,
    responseBody: [
      { name: 'id', type: 'string', required: true },
      { name: 'email', type: 'string', required: true },
      { name: 'createdAt', type: 'string', required: true, description: 'ISO-8601 timestamp.' },
    ],
  },
  render: (args) => (
    <div style={{ width: 560 }}>
      <SchemaDisplay {...args} />
    </div>
  ),
};
