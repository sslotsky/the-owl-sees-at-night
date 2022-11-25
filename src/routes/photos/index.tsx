import { Resource, component$, useStylesScoped$ } from '@builder.io/qwik';
import { RequestHandler, useEndpoint } from '@builder.io/qwik-city';
import { FileObject } from 'imagekit/dist/libs/interfaces';
import { appRouter } from '~/trcp/router';
import styles from './photos.css?inline';

export const onGet: RequestHandler<FileObject[]> = async () => {
  const caller = appRouter.createCaller({});
  return caller.searchPhotos();
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
