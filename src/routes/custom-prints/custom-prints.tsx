import {
  component$,
  useStyles$,
  useStore,
  useSignal,
  useTask$,
} from "@builder.io/qwik";
import { CustomPrintQuery } from "~/gql/graphql";
import { MasonryPhoto } from "~/trcp/router";
import Image from "./image";
import styles from "./custom-prints.css?inline";
import Preview from "./preview";
import { VariantArray, Variant } from "./types";
import { addToOrder } from "~/components/shop-context/context";

export function groupedVariants(data: CustomPrintQuery) {
  if (!data.product) {
    return {};
  }

  return data.product.variants.reduce<Record<string, VariantArray>>(
    (groups, variant) => {
      const { customFields } = variant;
      if (customFields?.material) {
        const group = groups[customFields.material] || [];
        group.push(variant);
        groups[customFields.material] = group;
      }

      return groups;
    },
    {}
  );
}

export function surfaceArea(print: Variant) {
  const { width, height } = print.customFields!;
  return width! * height!;
}

export function sortedPrints(prints: Variant[]) {
  return prints.sort((a, b) => {
    return surfaceArea(a) - surfaceArea(b);
  });
}

export const Tabs = (props: {
  data: CustomPrintQuery;
  store: { material: string; variant: Variant };
}) => {
  const groups = groupedVariants(props.data);
  const selectedGroup = sortedPrints(groups[props.store.material]);

  return (
    <div class="tabs">
      <div class="tab-bar">
        {Object.keys(groups).map((k) => (
          <button
            preventdefault:click
            class={`tab ${k === props.store.material ? "active" : ""}`}
            onClick$={() => {
              props.store.material = k;
            }}
          >
            {k}
          </button>
        ))}
      </div>
      <div class="scroll-container">
        <div class="tab-content">
          {selectedGroup &&
            selectedGroup.map((variant) => (
              <div class="flex-wrapper">
                <div
                  onClick$={() => (props.store.variant = variant)}
                  class={`print-size ${props.store.material} ${
                    variant.id === props.store.variant.id ? "active" : ""
                  }`}
                  style={`height: ${
                    variant.customFields!.height! * 10
                  }px; width: ${variant.customFields!.width! * 10}px`}
                >
                  <p>
                    {variant.customFields?.width}x{variant.customFields?.height}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default component$(
  (props: { files: MasonryPhoto[]; productData: CustomPrintQuery }) => {
    useStyles$(styles);
    if (!props.productData.product?.variants.length || !props.files.length) {
      return <></>;
    }

    const prints = sortedPrints(props.productData.product!.variants!);
    const slide = useSignal(1);
    const store = useStore({
      variant: prints[0],
      file: props.files[0],
      material: prints[0].customFields?.material || "",
      gridView: true,
      cropperTop: 0,
      cropperLeft: 0,
      cropperHeight: 0,
      cropperWidth: 0,
      printSizeX: prints[0].customFields?.width || 0,
      printSizeY: prints[0].customFields?.height || 0,
      zoomFactor: 1,
    });

    useTask$(({ track }) => {
      track(() => store.variant);

      store.printSizeX = store.variant.customFields?.width || 0;
      store.printSizeY = store.variant.customFields?.height || 0;
    });

    const image = useSignal<HTMLImageElement>();

    useTask$(({ track }) => {
      track(() => slide.value);

      if (image.value) {
        const maxZoomFactor =
          image.value.naturalWidth / image.value.clientWidth;
        store.zoomFactor =
          ((slide.value - 1) / (100 - 1)) * (maxZoomFactor - 1) + 1;
      }
    });

    const window = useSignal<HTMLImageElement>();

    const [left, top, width, height] = [
      store.cropperLeft,
      store.cropperTop,
      store.cropperWidth,
      store.cropperHeight,
    ].map((n) => n * (store.file.width / (image.value?.clientWidth || 1)));

    const transform = `tr:w-${width},h-${height},cm-extract,x-${left},y-${top}`;

    const { execute$, result } = addToOrder(
      store.variant.id,
      1,
      store.file.fileId,
      transform
    );

    return (
      <div class="custom-prints">
        <div>
          <div class="scroll-container bg-dark-shades max-height">
            {store.gridView ? (
              <div class="grid-wrap">
                <div class="photo-grid">
                  {props.files.map((f) => (
                    <div class="image-wrapper">
                      <img
                        onClick$={() => {
                          store.file = f;
                          store.gridView = false;
                        }}
                        loading="lazy"
                        src={f.masonryUrl}
                        alt={f.name}
                        style={`aspect-ratio: ${f.width}/${f.height}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div class="photo-crop letter-padding">
                <div class="nav-controls">
                  <button
                    onClick$={() => {
                      const oldX = store.printSizeX;
                      store.printSizeX = store.printSizeY;
                      store.printSizeY = oldX;
                    }}
                    class="rotate iconic"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="w-6 h-6"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                      />
                    </svg>
                  </button>
                  <button
                    onClick$={() => {
                      store.gridView = true;
                    }}
                    class="iconic"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="w-6 h-6"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 1.5v-1.5m0 0c0-.621.504-1.125 1.125-1.125m0 0h7.5"
                      />
                    </svg>
                  </button>
                  <button
                    onClick$={() => {
                      const index = props.files.indexOf(store.file) - 1;
                      store.file = props.files.at(index % props.files.length)!;
                    }}
                    class="iconic"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="w-6 h-6"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M21 16.811c0 .864-.933 1.405-1.683.977l-7.108-4.062a1.125 1.125 0 010-1.953l7.108-4.062A1.125 1.125 0 0121 8.688v8.123zM11.25 16.811c0 .864-.933 1.405-1.683.977l-7.108-4.062a1.125 1.125 0 010-1.953L9.567 7.71a1.125 1.125 0 011.683.977v8.123z"
                      />
                    </svg>
                  </button>
                  <button
                    class="iconic"
                    onClick$={() => {
                      const index = props.files.indexOf(store.file) + 1;
                      store.file = props.files.at(index % props.files.length)!;
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="w-6 h-6"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M3 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.953l-7.108 4.062A1.125 1.125 0 013 16.81V8.688zM12.75 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.953l-7.108 4.062a1.125 1.125 0 01-1.683-.977V8.688z"
                      />
                    </svg>
                  </button>
                </div>
                <div class="crop-region">
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={slide.value}
                    disabled={store.gridView}
                    onInput$={(_evt, el: HTMLInputElement) => {
                      slide.value = parseInt(el.value, 10);
                    }}
                  />
                  <Image store={store} imageRef={image} windowRef={window} />
                </div>
              </div>
            )}
          </div>
        </div>
        <div class="options-selector">
          <div class="preview-area graph-paper">
            <div class="controls">
              <div class="buttons">
                <button
                  class="iconic"
                  disabled={store.gridView || result.loading}
                  onClick$={execute$}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="w-6 h-6"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div class="preview">
              <Preview store={store} image={image} window={window} />
            </div>
          </div>
          <div class="selector-area">
            <Tabs data={props.productData} store={store} />
          </div>
        </div>
      </div>
    );
  }
);
