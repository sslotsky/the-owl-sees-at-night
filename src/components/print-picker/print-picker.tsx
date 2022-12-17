import { component$, useClientEffect$, useSignal, useStore, useStylesScoped$ } from '@builder.io/qwik';
import { FileObject } from 'imagekit/dist/libs/interfaces';
import { woodPrints } from '~/biz/prints';
import styles from './print-picker.css?inline';

interface Props {
  file: FileObject;
}

export default component$((props: Props) => {
  useStylesScoped$(styles);
  const { file } = props;
  const image = useSignal<Element>();
  const window = useSignal<Element>();
  const canvas = useSignal<Element>();
  const state = useStore({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    x: 8.5,
    y: 11,
    moving: false,
    zoomFactor: 1
  });

  useClientEffect$((ctx) => {
    ctx.track(() => state.x)
    ctx.track(() => state.y)
    ctx.track(() => state.zoomFactor)

    if (image.value) {
      const img = image.value;
      const maxX = img.clientWidth / state.x;
      const maxY = img.clientHeight / state.y;
      const scale = Math.min(maxX, maxY);
      state.width = state.x * scale / state.zoomFactor;
      state.height = state.y * scale / state.zoomFactor;
    }
  })

  useClientEffect$((ctx) => {
    ctx.track(() => state.x)
    ctx.track(() => state.y)
    ctx.track(() => state.top)
    ctx.track(() => state.left)
    ctx.track(() => state.width)
    ctx.track(() => state.height)

    if (window.value && canvas.value && image.value) {
      const el = canvas.value as HTMLCanvasElement;
      const context = el.getContext('2d');
      const scale = file.width / image.value.clientWidth;
      context?.clearRect(0, 0, el.width, el.height);
      context?.drawImage(
        window.value as HTMLImageElement,
        state.left * scale, state.top * scale,
        state.width * scale, state.height * scale,
        0, 0,
        el.width, el.height
      );
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
    <div class="print-picker">
      <div class="left-column">
        <div class="crop-zone">
          <img ref={image} src={file.url} />
          <div class="overlay">
            <img
              ref={window}
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
      </div>
      <div class="print-options">
        <div>
          <h2>Choose your print</h2>
          <div>
            {woodPrints.map((print) => {
              return (
                <div class="print-option" style={`height: ${print.height * 5}px; width: ${print.width * 5}px;`} onClick$={() => {
                  state.x = print.width;
                  state.y = print.height;
                  state.left = 0;
                  state.top = 0;
                }} />
              )
            })}
          </div>
        </div>
        <div>
          <h2>Print Preview</h2>
          <div class="print-preview">
            <div class="controls">
              <button onClick$={() => {
                const oldX = state.x;
                state.x = state.y;
                state.y = oldX;
                state.left = 0;
                state.top = 0;
              }} class="rotate">🔄 Rotate</button>
              <label>
                Zoom in
                <input type="range"
                  min={1}
                  max={100}
                  value={1}
                  onInput$={(_evt, el: HTMLInputElement) => {
                    console.log(el.value)
                    const maxZoomFactor = file.width / image.value!.clientWidth;
                    const val = parseInt(el.value, 10);
                    const scaledValue = (val - 1) / (100 - 1) * (maxZoomFactor - 1) + 1;
                    state.zoomFactor = scaledValue;
                    console.log(state.zoomFactor);
                  }}
                />
              </label>
            </div>
            <canvas style={`height: ${state.y * 20}px; width: ${state.x * 20}px;`} height={state.y * 40} width={state.x * 40} ref={canvas}></canvas>
          </div>
        </div>
      </div>
    </div>
  );
});
