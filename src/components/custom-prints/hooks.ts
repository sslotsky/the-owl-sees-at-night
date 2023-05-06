import type { ResourceReturn } from "@builder.io/qwik";
import {
  useResource$,
  useSignal,
  useTask$,
  useVisibleTask$,
} from "@builder.io/qwik";
import { isServer } from "@builder.io/qwik/build";
import type { MasonryPhoto } from "~/image-kit";

export type State = "blank" | "blurry" | "done";

export function useImageUrl(store: {
  file: MasonryPhoto;
}): ResourceReturn<string> {
  const state = useSignal<State>("blank");

  useTask$(({ track }) => {
    track(() => store.file);

    state.value = "blank";
  });

  useVisibleTask$(() => {
    state.value = "blurry";
  });

  const image = useResource$<string>(async ({ track }) => {
    track(() => state.value);

    if (isServer) {
      return store.file.fullSizeBlurUrl;
    }

    const img = new Image();

    if (state.value === "blank") {
      img.src = store.file.fullSizeBlurUrl;
      state.value = "blurry";
    } else {
      img.src = store.file.fullSizeUrl;
      await img.decode();
      state.value = "done";
    }

    return img.src;
  });

  return image;
}
