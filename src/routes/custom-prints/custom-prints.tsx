import { component$, useStylesScoped$, useSignal, Signal } from '@builder.io/qwik';
import { CustomPrintQuery } from '~/gql/graphql';
import { MasonryPhoto } from '~/trcp/router';
import styles from './custom-prints.css?inline';


type CustomPrint = NonNullable<CustomPrintQuery["product"]>;
type VariantArray = CustomPrint["variants"];

type Unarray<T> = T extends Array<infer U> ? U : never;
type Variant = NonNullable<Unarray<VariantArray>>;

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

export const Tabs = (props: { data: CustomPrintQuery, material: Signal<string>, variant: Signal<Variant> }) => {
  const groups = groupedVariants(props.data);
  const selectedGroup = sortedPrints(groups[props.material.value]);

  return (
    <div class="tabs">
      <div class="tab-bar">
        {Object.keys(groups).map((k) => (
          <button
            preventdefault:click
            class={`tab ${k === props.material.value ? 'active' : ''}`}
            onClick$={() => { 
              props.material.value = k;
            }}
          >{k}</button>
        ))}
      </div>
      <div class="scroll-container">
        <div class="tab-content">
          {selectedGroup && selectedGroup.map((variant) => (
            <div class="flex-wrapper">
              <div onClick$={() => props.variant.value = variant} class={`print-size ${variant.id === props.variant.value.id ? 'active' : ''}`} style={`height: ${variant.customFields!.height! * 10}px; width: ${variant.customFields!.width! * 10}px`}>
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
  useStylesScoped$(styles);
  const prints = sortedPrints(props.productData.product!.variants!);
  const material = useSignal(prints[0].customFields?.material || '');
  const selectedVariant = useSignal<Variant>(prints[0]!);

  return (
    <div class="custom-prints">
      <div>
        <div class="scroll-container">
          <div class="photo-grid">
            {props.files.map((f) => (
              <img src={f.masonryUrl} alt={f.name} />
            ))}
          </div>
        </div>
      </div>
      <div class="options-selector">
        <div class="preview-area">

        </div>
        <div class="selector-area">
          <Tabs data={props.productData} material={material} variant={selectedVariant} />
        </div>
      </div>
    </div>
  )
});
