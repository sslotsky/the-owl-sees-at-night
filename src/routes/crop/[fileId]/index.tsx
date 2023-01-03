import { component$, Resource } from '@builder.io/qwik';
import { RequestHandler, useEndpoint } from '@builder.io/qwik-city';
import { appRouter, MasonryPhoto } from '~/trcp/router';
import PrintPicker from '~/components/print-picker/print-picker';

export const onGet: RequestHandler<MasonryPhoto> = async ({ params }) => {
  const caller = appRouter.createCaller({});
  return caller.getPhoto(params.fileId)
}

export default component$(() => {
  const file = useEndpoint<MasonryPhoto>();

  return (
    <>
      <Resource
        value={file}
        onPending={() => <div>Loading...</div>}
        onRejected={() => <div>Error</div>}
        onResolved={(file: MasonryPhoto) => (
          <PrintPicker file={file} />
        )}
      />
    </>
  );
});