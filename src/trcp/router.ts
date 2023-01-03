import { initTRPC } from '@trpc/server';
import ImageKit from 'imagekit';
import { FileObject } from 'imagekit/dist/libs/interfaces';
import { z } from 'zod';

const imageKitId = import.meta.env.VITE_IMAGE_KIT_ID;
const publicKey = import.meta.env.VITE_IMAGE_KIT_PUBLIC_KEY;
const privateKey = import.meta.env.VITE_IMAGE_KIT_PRIVATE_KEY;

function mapFile(imageKit: ImageKit) {
  return function(f: FileObject): MasonryPhoto {
    return {
      ...f,
      originalUrl: imageKit.url({
        path: f.filePath,
        signed: true,
      }),
      masonryUrl: imageKit.url({
        path: f.filePath,
        signed: true,
        transformation: [{
          named: 'masonry'
        }]
      }),
      fullSizeUrl: imageKit.url({
        path: f.filePath,
        signed: true,
        transformation: [{
          named: 'full_size'
        }]
      }),
      fullSizeBlurUrl: imageKit.url({
        path: f.filePath,
        signed: true,
        transformation: [{
          named: 'full_size_blur'
        }]
      })
    };
  }
}

export interface MasonryPhoto extends FileObject {
  originalUrl: string;
  masonryUrl: string;
  fullSizeUrl: string;
  fullSizeBlurUrl: string;
}

const t = initTRPC.create();
export const appRouter = t.router({
  getPhoto: t.procedure
    .input(
      z.string()
    )
    .query<MasonryPhoto>(async ({ input: fileId }) => {
      const imageKit = new ImageKit({
        publicKey,
        privateKey,
        urlEndpoint: `https://ik.imagekit.io/${imageKitId}/`,
      });

      const file = await imageKit.getFileDetails(fileId);

      return mapFile(imageKit)(file);
    }),
  searchPhotos: t.procedure
    .query<MasonryPhoto[]>(async () => {
      const imageKit = new ImageKit({
        publicKey,
        privateKey,
        urlEndpoint: `https://ik.imagekit.io/${imageKitId}/`,
      });

      const files = await imageKit.listFiles({
        limit: 100,
        sort: 'DESC_UPDATED'
      });

      return files.map(mapFile(imageKit));
    })
});

export type AppRouter = typeof appRouter;