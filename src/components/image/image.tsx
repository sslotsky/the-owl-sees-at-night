import { component$, useClientEffect$, useSignal, useStylesScoped$ } from '@builder.io/qwik';
import { MasonryPhoto } from '~/trcp/router';
import styles from './image.css?inline';

interface Props {
  photo: MasonryPhoto;
}

export default component$((props: Props) => {
  useStylesScoped$(styles);

  const { photo } = props;
  const url = useSignal(photo.fullSizeBlurUrl)
  useClientEffect$(async () => {
    const image = new Image();
    image.src = photo.fullSizeUrl;
    await image.decode();
    url.value = image.src;
  })

  return (
    <img src={url.value} alt="hello" data-id={photo.fileId} />
  )
});
