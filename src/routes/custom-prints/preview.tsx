import { component$, Signal, useClientEffect$, useSignal } from "@builder.io/qwik";
import { MasonryPhoto } from "~/trcp/router";
import { Variant } from "./types";

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
  },
  image: Signal<HTMLImageElement | undefined>
  window: Signal<HTMLImageElement | undefined>
}

export const SCALE = 20;

export default component$((props: Props) => {
  // const customFields = props.store.variant.customFields || {};
  // const height = customFields.height || 0;
  // const width = customFields.width || 0;
  const canvas = useSignal<HTMLCanvasElement>();

  useClientEffect$(async ({ track }) => {
    track(() => props.store.file)
    track(() => props.store.variant)
    track(() => props.window)
    track(() => props.store.cropperTop)
    track(() => props.store.cropperLeft)
    track(() => props.store.cropperWidth)
    track(() => props.store.cropperHeight)
    track(() => props.store.printSizeX)
    track(() => props.store.printSizeY)

    if (props.window.value) {
      const img = props.window.value;
      img.decode().then(() => {
        if (canvas.value && img) {
          const ctx = canvas.value.getContext('2d');
          if (!ctx) {
            return;
          }

          const scale = img.naturalWidth / img.clientWidth;
          ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
          ctx.drawImage(
            img,
            props.store.cropperLeft * scale, props.store.cropperTop * scale,
            props.store.cropperWidth * scale, props.store.cropperHeight * scale,
            0, 0,
            canvas.value.width, canvas.value.height
          )
        }
      })
    }
  });

  return (
    <canvas 
      style={`height: ${props.store.printSizeY * SCALE}px; width: ${props.store.printSizeX * SCALE}px; border: 1px solid black;`} 
      height={props.store.printSizeY * SCALE * 2}
      width={props.store.printSizeX * SCALE * 2}
      ref={canvas} 
    />
  )
})