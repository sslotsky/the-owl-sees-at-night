import { Resource, component$, useStylesScoped$ } from '@builder.io/qwik';
import { RequestHandler, useEndpoint } from '@builder.io/qwik-city';
import ImageKit from 'imagekit';
import { FileObject } from 'imagekit/dist/libs/interfaces';
import styles from './photos.css?inline';

export const onGet: RequestHandler<FileObject[]> = async () => {
  const imageKitId = import.meta.env.VITE_IMAGE_KIT_ID;
  const publicKey = import.meta.env.VITE_IMAGE_KIT_PUBLIC_KEY;
  const privateKey = import.meta.env.VITE_IMAGE_KIT_PRIVATE_KEY;

  const imageKit = new ImageKit({
    publicKey,
    privateKey,
    urlEndpoint: `https://ik.imagekit.io/${imageKitId}/`
  });

  return imageKit.listFiles({limit: 10})
}

export default component$(() => {
  const data = useEndpoint<FileObject[]>();
  useStylesScoped$(styles);

  return (
    <Resource
      value={data}
      onPending={() => <div>Loading...</div>}
      onRejected={() => <div>Error</div>}
      onResolved={(files) => (
        <div id="photos">
          {files.map((f: FileObject) => (
            <img src={`${f.url}?tr=w-300`} alt={f.name} />
          ))}
        </div>
      )}
    />
  )
});
