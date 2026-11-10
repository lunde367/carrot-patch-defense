// Tiny event bus so the game engine never talks to the DOM, audio or ads directly.
const handlers = {};
export const on = (name, fn) => { (handlers[name] ||= []).push(fn); };
export const emit = (name, data) => { for (const fn of handlers[name] || []) fn(data); };
