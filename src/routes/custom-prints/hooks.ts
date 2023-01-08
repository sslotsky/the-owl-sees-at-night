import {
  useResource$,
  useSignal,
  useTask$,
  ResourceReturn,
} from "@builder.io/qwik";
import { MasonryPhoto } from "~/trcp/router";

export type State = "blank" | "blurry" | "done";

export function useImageUrl(store: {
  file: MasonryPhoto;
}): ResourceReturn<string> {
  const state = useSignal<State>("blank");

  useTask$(({ track }) => {
    track(() => store.file);

    state.value = "blank";
  });

  const image = useResource$<string>(async ({ track }) => {
    track(() => state.value);

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
