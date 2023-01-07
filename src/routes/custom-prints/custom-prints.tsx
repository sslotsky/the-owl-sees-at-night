import { component$, useStyles$, useStore, useSignal, useTask$ } from '@builder.io/qwik';
import { CustomPrintQuery } from '~/gql/graphql';
import { MasonryPhoto } from '~/trcp/router';
import Image from './image';
import styles from './custom-prints.css?inline';
import Preview from './preview';
import { VariantArray, Variant } from './types';


export function groupedVariants(data: CustomPrintQuery) {
  if (!data.product) {
    return {};
  }

  return data.product.variants.reduce<Record<string, VariantArray>>((groups, variant) => {
    const { customFields } = variant;
    if (customFields?.material) {
      const group = groups[customFields.material] || [];
      group.push(variant);
      groups[customFields.material] = group;
    }

    return groups;
  }, {});
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

export const Tabs = (props: { data: CustomPrintQuery, store: { material: string, variant: Variant } }) => {
  const groups = groupedVariants(props.data);
  const selectedGroup = sortedPrints(groups[props.store.material]);

  return (
    <div class="tabs">
      <div class="tab-bar">
        {Object.keys(groups).map((k) => (
          <button
            preventdefault:click
            class={`tab ${k === props.store.material ? 'active' : ''}`}
            onClick$={() => { 
              props.store.material = k;
            }}
          >{k}</button>
        ))}
      </div>
      <div class="scroll-container">
        <div class="tab-content">
          {selectedGroup && selectedGroup.map((variant) => (
            <div class="flex-wrapper">
              <div onClick$={() => props.store.variant = variant} class={`print-size ${variant.id === props.store.variant.id ? 'active' : ''}`} style={`height: ${variant.customFields!.height! * 10}px; width: ${variant.customFields!.width! * 10}px`}>
                <p>{variant.customFields?.width}x{variant.customFields?.height}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

}

export default component$((props: {
  files: MasonryPhoto[],
  productData: CustomPrintQuery
}) => {
  useStyles$(styles);
  if (!props.productData.product?.variants.length || !props.files.length) {
    return <></>;
  }

  const prints = sortedPrints(props.productData.product!.variants!);
  const store = useStore({
    variant: prints[0],
    file: props.files[0],
    material: prints[0].customFields?.material || '',
    gridView: true,
    cropperTop: 0,
    cropperLeft: 0,
    cropperHeight: 0,
    cropperWidth: 0,
    printSizeX: prints[0].customFields?.width || 0,
    printSizeY: prints[0].customFields?.height || 0
  });

  useTask$(({ track }) => {
    track(() => store.variant)

    store.printSizeX = store.variant.customFields?.width || 0;
    store.printSizeY = store.variant.customFields?.height || 0;
  })

  const image = useSignal<HTMLImageElement>();
  const window = useSignal<HTMLImageElement>();

  return (
    <div class="custom-prints">
      <div>
        <div class="scroll-container hero-hex">
          {store.gridView ? (
            <div class="photo-grid">
              {props.files.map((f) => (
                <img 
                  onClick$={() => { 
                    store.file = f; 
                    store.gridView = false;
                  }} 
                  loading="lazy"
                  src={f.masonryUrl}
                  alt={f.name}
                />
              ))}
            </div>
          ) : (
            <div class="photo-crop">
              <div>
                <button onClick$={() => { store.gridView = true }}>Back to grid</button>
                <button onClick$={() => {
                  const index = props.files.indexOf(store.file) - 1;
                  store.file = props.files.at(index % props.files.length)!;
                }}>Prev</button>
                <button onClick$={() => {
                  const index = props.files.indexOf(store.file) + 1;
                  store.file = props.files.at(index % props.files.length)!;
                }}>Next</button>
              </div>
              <div class="crop-region">
                <Image store={store} imageRef={image} windowRef={window} />
              </div>
            </div>
          )}
        </div>
      </div>
      <div class="options-selector">
        <div class="preview-area brick-wall">
          <div class="controls">
            <button onClick$={() => {
              const oldX = store.printSizeX;
              store.printSizeX = store.printSizeY;
              store.printSizeY = oldX;
            }} class="rotate">🔄 Rotate</button>
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
  )
});
