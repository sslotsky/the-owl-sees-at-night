import { component$, Resource, useClientEffect$, useSignal, useStore, useStylesScoped$ } from '@builder.io/qwik';
import { RequestHandler, useEndpoint } from '@builder.io/qwik-city';
import { FileObject } from 'imagekit/dist/libs/interfaces';
import { woodPrints } from '~/biz/prints';
import { appRouter } from '~/trcp/router';
import styles from './crop.css?inline';
// import { woodPrints } from '~/biz/prints';


export const onGet: RequestHandler<FileObject> = async ({ params }) => {
  const caller = appRouter.createCaller({});
  return caller.getPhoto(params.fileId)
}

export default component$(() => {
  useStylesScoped$(styles);
  const file = useEndpoint<FileObject>();
  const image = useSignal<Element>();
  const state = useStore({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    x: 8.5,
    y: 11,
    moving: false
  });

  useClientEffect$((ctx) => {
    ctx.track(() => state.x)
    ctx.track(() => state.y)

    if (image.value) {
      console.log('happening')
      const img = image.value;
      const maxX = Math.floor(img.clientWidth / state.x);
      const maxY = Math.floor(img.clientHeight / state.y);
      const scale = Math.min(maxX, maxY);
      state.width = state.x * scale;
      state.height = state.y * scale;
    }
  })

  const [offsetLeft, offsetTop, offsetRight, offsetBottom] = [
    state.left,
    state.top,
    (image.value?.clientWidth || 0) - (state.left + state.width),
    (image.value?.clientHeight || 0) - (state.top + state.height)
  ]

  const clipPath = `clip-path: inset(${offsetTop}px ${offsetRight}px ${offsetBottom}px ${offsetLeft}px)`;

  return (
    <Resource
      value={file}
      onPending={() => <div>Loading...</div>}
      onRejected={() => <div>Error</div>}
      onResolved={(file: FileObject) => (
        <div class="print-picker">
          <div class="crop-zone">
            <img ref={image} src={file.url} />
            <div class="overlay">
              <img
                preventdefault:pointerdown
                style={clipPath}
                src={file.url}
                onPointerDown$={() => {
                  state.moving = true;
                }}
                onPointerUp$={() => {
                  state.moving = false;
                }}
                onPointerOut$={() => {
                  state.moving = false;
                }}
                onPointerMove$={(e) => {
                  if (state.moving) {
                    state.left = Math.max(
                      0,
                      Math.min(
                        state.left + e.movementX,
                        (image.value?.clientWidth || 0) - state.width
                      )
                    )
                    state.top = Math.max(
                      0,
                      Math.min(
                        state.top + e.movementY,
                        (image.value?.clientHeight || 0) - state.height
                      )
                    )
                  }
                }}
              />
            </div>
          </div>
          <div class="print-options">
            <h2>Choose your print</h2>
            <div>
              {woodPrints.map((print) => {
                return (
                  <div class="print-option" style={`height: ${print.height * 5}px; width: ${print.width * 5}px;`} onClick$={() => {
                    state.x = print.width;
                    state.y = print.height;
                  }} />
                )
              })}
            </div>
            <div>
              {woodPrints.map((print) => {
                return (
                  <div class="print-option" style={`height: ${print.width * 5}px; width: ${print.height * 5}px;`} onClick$={() => {
                    state.y = print.width;
                    state.x = print.height;
                  }} />
                )
              })}
            </div>
          </div>
        </div>
      )}
    />
  );
});