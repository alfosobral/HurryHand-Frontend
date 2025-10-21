import { useCallback, useState } from "react";

/**
 * Detecta foco dentro de un contenedor (cualquier hijo).
 * - Devuelve `focused` y `focusWithinProps` para esparcir en el wrapper.
 * - No pisa tus handlers: podés combinarlos con mergeHandlers (abajo).
 */
export default function useFocusWithin(initial = false) {
  const [focused, setFocused] = useState(!!initial);

  const onFocus = useCallback(() => setFocused(true), []);
  const onBlur = useCallback((e) => {
    // si el foco se mueve fuera del contenedor, apaga
    const next = e.relatedTarget;
    if (!e.currentTarget.contains(next)) setFocused(false);
  }, []);

  return {
    focused,
    focusWithinProps: { onFocus, onBlur },
  };
}

/** Utilidad opcional para combinar handlers sin sobrescribirlos */
export function mergeHandlers(user, ours) {
  return (...args) => {
    try { ours?.(...args); } finally { user?.(...args); }
  };
}
