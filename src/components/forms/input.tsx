import type {  QwikIntrinsicElements } from "@builder.io/qwik";
import { useSignal } from "@builder.io/qwik";
import { component$, $ } from "@builder.io/qwik";

export default component$((props: QwikIntrinsicElements['input']) => {
  const { children: _, onBlur$, class: klass, ...rest } = props;
  const dirty = useSignal(false);

  const classList = dirty.value
    ? `${klass?.toString()} dirty`
    : klass;

  return (
    <input
      onBlur$={[onBlur$, $(() => {
        dirty.value = true;
      })]}
      class={classList}
     {...rest}
    />
  )
});
