import { component$, useClientEffect$, useSignal } from '@builder.io/qwik';
import { MasonryPhoto } from '~/trcp/router';

interface Props {
  photo: MasonryPhoto;
}

export default component$((props: Props) => {
  const { photo } = props;
  const url = useSignal(photo.fullSizeBlurUrl)
  useClientEffect$(async () => {
    console.log('ehllo')
    const image = new Image();
    image.src = photo.fullSizeUrl;
    await image.decode();
    url.value = image.src;
  })

  return (
    <img src={url.value} alt="hello" />
  )
});
