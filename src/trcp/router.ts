import { initTRPC } from '@trpc/server';
import ImageKit from 'imagekit';

const t = initTRPC.create();
export const appRouter = t.router({
  searchPhotos: t.procedure
    .query(async () => {
      const imageKitId = import.meta.env.VITE_IMAGE_KIT_ID;
      const publicKey = import.meta.env.VITE_IMAGE_KIT_PUBLIC_KEY;
      const privateKey = import.meta.env.VITE_IMAGE_KIT_PRIVATE_KEY;

      const imageKit = new ImageKit({
        publicKey,
        privateKey,
        urlEndpoint: `https://ik.imagekit.io/${imageKitId}/`,
      });

      const files = await imageKit.listFiles({
        limit: 100,
        sort: 'DESC_UPDATED'
      });

      return files.map(f => ({
        ...f,
        url: imageKit.url({
          path: f.filePath,
          signed: true,
          transformation: [{
            width: 300
          }]
        })
      }))
    })
});

export type AppRouter = typeof appRouter;