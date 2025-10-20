
import { useCallback, useState } from "react";

export default function useForm(
  initial = {},
  validators = {},
  { validateOnChange = false, dependencies = {} } = {}
) {
  const [values, setValues]   = useState(initial);
  const [touched, setTouched] = useState({});
  const [errors, setErrors]   = useState({});

  const validateField = useCallback(
    async (name, value, all = values) => {
      const fn = validators[name];
      if (!fn) return "";
      const res = fn(value, all);
      const msg = res instanceof Promise ? await res : res;
      setErrors((e) => ({ ...e, [name]: msg || "" }));
      return msg || "";
    },
    [validators, values]
  );

  const validateMany = useCallback(async (names, nextValues = values) => {
    const results = await Promise.all(
      names.map((n) => validateField(n, nextValues[n], nextValues))
    );
    return results.every((m) => !m);
  }, [validateField, values]);

  const handleChange = useCallback(
    (name) => async (e) => {
      const v = e?.target?.value ?? "";
      setValues((prev) => {
        const next = { ...prev, [name]: v };

        // valida el campo que cambió
        if (validateOnChange) validateField(name, v, next);

        // valida dependientes (ej: password -> confirm)
        const dependents = dependencies[name] || [];
        for (const dep of dependents) {
          validateField(dep, next[dep], next);
        }

        return next;
      });
    },
    [validateField, validateOnChange, dependencies]
  );

  const handleBlur = useCallback(
    (name) => async () => {
      setTouched((t) => ({ ...t, [name]: true }));
      const next = { ...values }; // estado actual
      await validateField(name, next[name], next);

      // también revalidá dependientes en blur
      const dependents = dependencies[name] || [];
      await validateMany(dependents, next);
    },
    [validateField, validateMany, values, dependencies]
  );

  const validateAll = useCallback(async () => {
    const fields = Object.keys(validators);
    return validateMany(fields, values);
  }, [validators, values, validateMany]);

  const isValid = Object.values(errors).every((m) => !m);

  return {
    values, setValues,
    touched, setTouched,
    errors, setErrors,
    isValid,
    handleChange, handleBlur,
    validateField, validateAll,
  };
}
