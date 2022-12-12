import { component$, Resource, useClientEffect$, useSignal, useStore, useStylesScoped$ } from '@builder.io/qwik';
import { RequestHandler, useEndpoint } from '@builder.io/qwik-city';
import { FileObject } from 'imagekit/dist/libs/interfaces';
import { appRouter } from '~/trcp/router';
import styles from './crop.css?inline';

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

  useClientEffect$(() => {
    if (image.value) {
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
        <>
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
          <p>{JSON.stringify(file, null, 2)}</p>
        </>
      )}
    />
  );
});