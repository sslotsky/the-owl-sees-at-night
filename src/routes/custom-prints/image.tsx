import { component$, Signal, useClientEffect$, useSignal, useStore } from '@builder.io/qwik';
import { MasonryPhoto } from '~/trcp/router';
import { Variant } from './types';

interface Props {
  store: {
    file: MasonryPhoto;
    variant: Variant;
    cropperTop: number;
    cropperLeft: number;
    cropperHeight: number;
    cropperWidth: number;
    printSizeX: number;
    printSizeY: number;
  },
  imageRef: Signal<HTMLImageElement | undefined>
  windowRef: Signal<HTMLImageElement | undefined>
}

export default component$((props: Props) => {
  const url = useSignal<string>(props.store.file.fullSizeBlurUrl)
  const cropper = useStore({
    imageWidth: 0,
    imageHeight: 0,
    moving: false,
    initialized: false
  });

  useClientEffect$(async ({ track }) => {
    track(() => props.store.file)
    url.value = props.store.file.fullSizeBlurUrl;
    const image = new Image();
    image.src = props.store.file.fullSizeUrl;
    image.decode().then(() => {
      url.value = image.src;
    });
  });

  useClientEffect$(async ({ track }) => {
    track(() => props.store.file);
    track(() => props.store.printSizeX);
    track(() => props.store.printSizeY);
    if (props.windowRef.value) {
      const img = props.windowRef.value;
      img.decode().then(() => {
        const maxX = img.clientWidth / props.store.printSizeX;
        const maxY = img.clientHeight / props.store.printSizeY;
        const scale = Math.min(maxX, maxY);
        props.store.cropperWidth = props.store.printSizeX * scale;
        props.store.cropperHeight = props.store.printSizeY * scale;
        cropper.imageWidth = img.clientWidth;
        cropper.imageHeight = img.clientHeight;

        if (cropper.initialized) {
          if ((props.store.cropperTop + props.store.cropperHeight) > img.clientHeight) {
            props.store.cropperTop -= props.store.cropperTop + props.store.cropperHeight - img.clientHeight;
          } 

          if ((props.store.cropperLeft + props.store.cropperWidth) > img.clientWidth) {
            props.store.cropperLeft -= props.store.cropperLeft + props.store.cropperWidth - img.clientWidth;
          }
        } else {
          cropper.initialized = true;
          props.store.cropperLeft = (img.clientWidth - props.store.cropperWidth) / 2; 
          props.store.cropperTop = (img.clientHeight - props.store.cropperHeight) / 2;
        }
      });
    }
  });

  const [offsetLeft, offsetTop, offsetRight, offsetBottom] = [
    props.store.cropperLeft,
    props.store.cropperTop,
    cropper.imageWidth - (props.store.cropperLeft + props.store.cropperWidth),
    cropper.imageHeight - (props.store.cropperTop + props.store.cropperHeight)
  ]

  const clipPath = `clip-path: inset(${offsetTop}px ${offsetRight}px ${offsetBottom}px ${offsetLeft}px)`;

  return (
    <div 
      onPointerMove$={(e) => {
        if (cropper.moving) {
          props.store.cropperLeft = Math.max(
            0,
            Math.min(
              props.store.cropperLeft + e.movementX,
              (props.imageRef.value?.clientWidth || 0) - props.store.cropperWidth
            )
          )
          props.store.cropperTop = Math.max(
            0,
            Math.min(
              props.store.cropperTop + e.movementY,
              (props.imageRef.value?.clientHeight || 0) - props.store.cropperHeight
            )
          )
        }
      }}
    class="wrapper">
      <img src={url.value} alt="hello" data-id={props.store.file.fileId} ref={props.imageRef} />
      <div 
        onPointerUp$={() => {
          cropper.moving = false;
        }}
        class="overlay"
      >
        <img 
          class="crop-window"
          style={clipPath} 
          preventdefault:pointerdown
          onPointerDown$={() => {
            cropper.moving = true;
          }}
          src={props.store.file.fullSizeUrl} 
          data-id={props.store.file.fileId} 
          ref={props.windowRef}
        />
      </div>
    </div>
  )
});

