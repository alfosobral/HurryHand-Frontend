export const compose = (...validators) => (value, allValues) => {
  for (const fn of validators) {
    const res = fn?.(value, allValues);
    if (typeof res === "string" && res) return res; // primer error
  }
  return "";
};

export const composeAsync = (...validators) => async (value, allValues) => {
  for (const fn of validators) {
    const res = fn?.(value, allValues);
    const msg = res instanceof Promise ? await res : res;
    if (typeof msg === "string" && msg) return msg;
  }
  return "";
};
