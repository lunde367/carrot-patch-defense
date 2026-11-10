// Tiny event bus so game rules never talk to the screen, sound or ads directly.
// on() returns a function that removes the listener.
const handlers = {};
export function on(name, fn){
  (handlers[name] ||= []).push(fn);
  return () => { handlers[name] = handlers[name].filter(f => f !== fn); };
}
export function emit(name, data){ for (const fn of [...(handlers[name] || [])]) fn(data); }
