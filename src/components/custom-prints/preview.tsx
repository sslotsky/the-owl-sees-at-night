import type {
  Signal} from "@builder.io/qwik";
import {
  component$,
  useVisibleTask$,
  useSignal,
} from "@builder.io/qwik";
import type { MasonryPhoto } from "~/image-kit";
import type { Variant } from "./types";
import { divide } from "~/utils/math";

export interface Props {
  store: {
    file: MasonryPhoto;
    variant: Variant;
    cropperLeft: number;
    cropperTop: number;
    cropperHeight: number;
    cropperWidth: number;
    printSizeX: number;
    printSizeY: number;
    gridView: boolean;
  };
  image: Signal<HTMLImageElement | undefined>;
  window: Signal<HTMLImageElement | undefined>;
}

export const SCALE = 20;

export default component$((props: Props) => {
  const canvas = useSignal<HTMLCanvasElement>();

  useVisibleTask$(
    async ({ track }) => {
      track(() => props.store.file);
      track(() => props.store.variant);
      track(() => props.store.gridView);
      track(() => props.store.cropperTop);
      track(() => props.store.cropperLeft);
      track(() => props.store.cropperWidth);
      track(() => props.store.cropperHeight);
      track(() => props.store.printSizeX);
      track(() => props.store.printSizeY);

      if (props.store.gridView) {
        const image = new Image();
        image.src = "/sample-image.webp";
        image.decode().then(() => {
          if (canvas.value) {
            const ctx = canvas.value.getContext("2d");
            if (!ctx) {
              return;
            }

            const maxX = divide(image.naturalWidth, props.store.printSizeX);
            const maxY = divide(image.naturalHeight, props.store.printSizeY);
            const scale = Math.min(maxX, maxY);
            const [width, height] = [
              props.store.printSizeX * scale,
              props.store.printSizeY * scale,
            ];
            const sx = (image.naturalWidth - width) / 2;
            const sy = (image.naturalHeight - height) / 2;

            ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
            ctx.drawImage(
              image,
              sx,
              sy,
              width,
              height,
              0,
              0,
              canvas.value.width,
              canvas.value.height
            );
          }
        });
      } else if (props.window.value) {
        const img = props.window.value;
        img.decode().then(() => {
          if (canvas.value && img) {
            const ctx = canvas.value.getContext("2d");
            if (!ctx) {
              return;
            }

            const scale = divide(img.naturalWidth, img.clientWidth);
            ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
            ctx.drawImage(
              img,
              props.store.cropperLeft * scale,
              props.store.cropperTop * scale,
              props.store.cropperWidth * scale,
              props.store.cropperHeight * scale,
              0,
              0,
              canvas.value.width,
              canvas.value.height
            );
          }
        });
      }
    },
  );

  return (
    <>
    <div class="preview-container">
      <canvas
        style={`height: ${props.store.printSizeY * SCALE}px; width: ${
          props.store.printSizeX * SCALE
        }px;`}
        height={props.store.printSizeY * SCALE * 2}
        width={props.store.printSizeX * SCALE * 2}
        class={props.store.variant.customFields?.material}
        ref={canvas}
      />
      {props.store.gridView && (
        <div
          style={`height: ${props.store.printSizeY * SCALE}px; width: ${
            props.store.printSizeX * SCALE
          }px;`}
          class="preview-overlay"
        >
          <p>Please Select a Photo</p>
        </div>
      )}
    </div>
    </>
  );
});
