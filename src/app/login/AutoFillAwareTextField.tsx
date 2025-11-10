import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { TextField } from '@mui/material';

type AutoFillAwareTextFieldProps = React.ComponentProps<typeof TextField>;

function chain<F extends (...args: any[]) => any>(
  ...fns: Array<F | undefined>
) {
  return (...args: Parameters<F>) => {
    for (const fn of fns) fn?.(...args);
  };
}

const AutoFillAwareTextField = ({
  onChange,
  inputProps,
  InputLabelProps,
  value,
  defaultValue,
  ...rest
}: AutoFillAwareTextFieldProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  // estado inicial: considera value/defaultValue já passados
  const initialHasValue = useMemo(() => {
    const v = value ?? defaultValue;

    return v !== undefined && String(v).length > 0;
  }, [value, defaultValue]);

  const [fieldHasValue, setFieldHasValue] = useState<boolean>(initialHasValue);

  // Detecta autofill via animação do MUI (Chrome/Safari)
  const handleAnimationStart = useCallback((e: AnimationEvent) => {
    const target = e.target as HTMLInputElement | null;

    if (!target) return;

    if (
      e.animationName === 'mui-auto-fill' ||
      e.animationName === 'mui-auto-fill-cancel'
    ) {
      // Confere tanto o pseudo quanto o value real
      const autofilled =
        target.matches('*:-webkit-autofill') || target.value !== '';

      setFieldHasValue(autofilled);
    }
  }, []);

  // Atualiza quando o usuário digita / quando o value é controlado
  const _onChange = useCallback<
    NonNullable<AutoFillAwareTextFieldProps['onChange']>
  >(
    (e) => {
      onChange?.(e);
      setFieldHasValue(e.target.value !== '');
    },
    [onChange],
  );

  // Firefox/Edge: o autofill pode disparar apenas 'input'
  const handleInput = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    const target = e.currentTarget;

    if (!target) return;

    if (target.value !== '' || target.matches('*:-webkit-autofill')) {
      setFieldHasValue(true);
    }
  }, []);

  // Sincroniza após montagem (captura autofill já aplicado antes de eventos)
  useEffect(() => {
    const sync = () => {
      const el = inputRef.current;

      if (!el) return;
      const has = el.value !== '' || el.matches?.('*:-webkit-autofill');

      if (has !== fieldHasValue) setFieldHasValue(has);
    };

    // rAF duplo garante que o navegador terminou o autofill
    requestAnimationFrame(() => requestAnimationFrame(sync));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Permite ao chamador forçar shrink: se vier definido, respeitamos
  const mergedInputLabelProps = {
    ...InputLabelProps,
    shrink: InputLabelProps?.shrink ?? fieldHasValue,
  };

  // Encadeia handlers vindos de fora
  const mergedInputProps = {
    ...(inputProps || {}),
    ref: (node: HTMLInputElement) => {
      inputRef.current = node;

      // mantém ref do chamador se existir
      const theirRef = (inputProps as any)?.ref;

      if (typeof theirRef === 'function') theirRef(node);
      else if (theirRef && typeof theirRef === 'object')
        theirRef.current = node;
    },
    onAnimationStart: chain(
      inputProps?.onAnimationStart as any,
      handleAnimationStart as any,
    ),
    onInput: chain(inputProps?.onInput as any, handleInput as any),
  };

  return (
    <TextField
      {...rest}
      value={value}
      defaultValue={defaultValue}
      onChange={_onChange}
      InputLabelProps={mergedInputLabelProps}
      inputProps={mergedInputProps}
    />
  );
};

export default AutoFillAwareTextField;
