import { component$, Resource } from '@builder.io/qwik';
import { RequestHandler, useEndpoint } from '@builder.io/qwik-city';
import { FileObject } from 'imagekit/dist/libs/interfaces';
import { appRouter } from '~/trcp/router';
import PrintPicker from '~/components/print-picker/print-picker';

export const onGet: RequestHandler<FileObject> = async ({ params }) => {
  const caller = appRouter.createCaller({});
  return caller.getPhoto(params.fileId)
}

export default component$(() => {
  const file = useEndpoint<FileObject>();

  return (
    <Resource
      value={file}
      onPending={() => <div>Loading...</div>}
      onRejected={() => <div>Error</div>}
      onResolved={(file: FileObject) => (
        <PrintPicker file={file} />
      )}
    />
  );
});