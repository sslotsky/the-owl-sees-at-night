import { Resource, component$ } from '@builder.io/qwik';
import { RequestHandler, useEndpoint } from '@builder.io/qwik-city';
import ImageKit from 'imagekit';
import { FileObject } from 'imagekit/dist/libs/interfaces';

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
  return (
    <Resource
      value={data}
      onPending={() => <div>Loading...</div>}
      onRejected={() => <div>Error</div>}
      onResolved={(files) => (
        <div>
          {files.map((f: FileObject) => (
            <img src={f.url} alt={f.name} />
          ))}
        </div>
      )}
    />
  )
});
