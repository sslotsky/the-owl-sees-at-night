import type { HTMLAttributes, QRL } from "@builder.io/qwik";
import {
  component$,
  Slot,
  useSignal,
  useTask$,
} from "@builder.io/qwik";

interface Movement {
  changeX: number;
  changeY: number;
}

interface Props extends HTMLAttributes<HTMLDivElement> {
  tracking: boolean;
  callback$: QRL<(movement: Movement) => void>;
}

export default component$((props: Props) => {
  const { tracking, callback$, ...divProps } = props;
  const lastTouch = useSignal<[number, number]>();

  useTask$(({ track }) => {
    track(() => tracking);

    if (!tracking) {
      lastTouch.value = undefined;
    }
  });

  return (
    <div
      {...divProps}
      onTouchMove$={(e) => {
        if (tracking) {
          const [touch] = e.changedTouches;
          if (lastTouch.value) {
            const [lastX, lastY] = lastTouch.value;
            const changeX = touch.clientX - lastX;
            const changeY = touch.clientY - lastY;
            callback$({ changeX, changeY });
          }

          lastTouch.value = [touch.clientX, touch.clientY];
        }
      }}
      onPointerMove$={(e) => {
        if (tracking) {
          callback$({
            changeX: e.movementX,
            changeY: e.movementY,
          });
        }
      }}
    >
      <Slot />
    </div>
  );
});
