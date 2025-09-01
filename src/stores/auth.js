import { writable, derived } from 'svelte/store';

export const user = writable(null);
export const isLoggedIn = derived(user, $user => !!$user);