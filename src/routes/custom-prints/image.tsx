import { component$, Signal, useClientEffect$, useStore } from '@builder.io/qwik';
import { MasonryPhoto } from '~/trcp/router';
import DragTracker from './drag-tracker';
import { useImageUrl } from './hooks';
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
    zoomFactor: number;
    gridView: boolean;
  },
  imageRef: Signal<HTMLImageElement | undefined>
  windowRef: Signal<HTMLImageElement | undefined>
}

export default component$((props: Props) => {
  const url = useImageUrl(props.store);

  const cropper = useStore({
    imageWidth: 0,
    imageHeight: 0,
    moving: false,
    initialized: false
  });


  useClientEffect$(async ({ track }) => {
    track(() => props.store.file);
    track(() => props.store.printSizeX);
    track(() => props.store.printSizeY);
    track(() => props.store.zoomFactor);
    if (props.windowRef.value) {
      const img = props.windowRef.value;
      img.decode().then(() => {
        const maxX = img.clientWidth / props.store.printSizeX;
        const maxY = img.clientHeight / props.store.printSizeY;
        const scale = Math.min(maxX, maxY);
        props.store.cropperWidth = props.store.printSizeX * scale / props.store.zoomFactor;
        props.store.cropperHeight = props.store.printSizeY * scale / props.store.zoomFactor;
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
      }).catch(
        // This happens if the user is quickly changing their photo selection.
        // It's not really an error and creates no negative side effects.
      );
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
    <DragTracker
      class="wrapper"
      tracking={cropper.moving}
      callback$={(movement) => {
        props.store.cropperLeft = Math.max(
          0,
          Math.min(
            props.store.cropperLeft + movement.changeX,
            (props.imageRef.value?.clientWidth || 0) - props.store.cropperWidth
          )
        )
        props.store.cropperTop = Math.max(
          0,
          Math.min(
            props.store.cropperTop + movement.changeY,
            (props.imageRef.value?.clientHeight || 0) - props.store.cropperHeight
          )
        )
      }}
    >
      {url.value.then((imgUrl) => (
        <img src={imgUrl} alt="hello" data-id={props.store.file.fileId} ref={props.imageRef} />
      ))}
      <div 
        onTouchEnd$={() => {
          cropper.moving = false;
        }}
        onPointerUp$={() => {
          cropper.moving = false;
        }}
        class="overlay"
      >
        <img 
          class="crop-window"
          style={clipPath} 
          preventdefault:pointerdown
          onTouchStart$={() => {
            cropper.moving = true;
          }}
          onPointerDown$={() => {
            cropper.moving = true;
          }}
          src={props.store.file.fullSizeUrl} 
          data-id={props.store.file.fileId} 
          ref={props.windowRef}
        />
      </div>
    </DragTracker>
  )
});

