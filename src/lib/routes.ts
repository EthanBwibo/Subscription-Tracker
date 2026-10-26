import type { Href } from 'expo-router';

// Hrefs for subscription screens. Built by hand because the locally generated typed routes
// mis-handle nested index routes (they expect '/subscriptions/index').
export const routes = {
  list: '/subscriptions' as Href,
  add: '/subscriptions/new' as Href,
  detail: (id: string) => `/subscriptions/${id}` as Href,
  edit: (id: string) => `/subscriptions/${id}/edit` as Href,
};
