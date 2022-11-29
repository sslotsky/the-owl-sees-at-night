import { Resource, component$ } from '@builder.io/qwik';
import { DocumentHead, RequestHandler, useEndpoint } from '@builder.io/qwik-city';
import { FileObject } from 'imagekit/dist/libs/interfaces';
import Photos from '~/components/photos/photos';
import { appRouter, MasonryPhoto } from '~/trcp/router';

export const onGet: RequestHandler<MasonryPhoto[]> = async () => {
  const caller = appRouter.createCaller({});
  return caller.searchPhotos();
}

export default component$(() => {
  const data = useEndpoint<FileObject[]>();

  return (
    <Resource
      value={data}
      onPending={() => <div>Loading...</div>}
      onRejected={() => <div>Error</div>}
      onResolved={(files) => (
        <Photos files={files} indexParam="viewing" />
      )}
    />
  )
});


export const head: DocumentHead = {
  title: 'Latest Photos',
  meta: [
    {
      name: 'description',
      content: 'Latest photos',
    },
  ],
};
