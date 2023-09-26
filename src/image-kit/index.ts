import ImageKit from "imagekit";
import type { FileObject } from "imagekit/dist/libs/interfaces";

export interface MasonryPhoto extends FileObject {
  originalUrl: string;
  masonryUrl: string;
  fullSizeUrl: string;
  fullSizeBlurUrl: string;
}

function mapFile(imageKit: ImageKit) {
  return function (f: FileObject): MasonryPhoto {
    return {
      ...f,
      originalUrl: imageKit.url({
        path: f.filePath,
        signed: true,
      }),
      masonryUrl: imageKit.url({
        path: f.filePath,
        signed: true,
        transformation: [
          {
            named: "masonry",
          },
        ],
      }),
      fullSizeUrl: imageKit.url({
        path: f.filePath,
        signed: true,
        transformation: [
          {
            named: "full_size",
          },
        ],
      }),
      fullSizeBlurUrl: imageKit.url({
        path: f.filePath,
        signed: true,
        transformation: [
          {
            named: "full_size_blur",
          },
        ],
      }),
    };
  };
}

export interface ImageKitCreds {
  publicKey: string;
  privateKey: string;
  imageKitId: string;
}

export async function getPhotos({
  publicKey,
  privateKey,
  imageKitId,
}: ImageKitCreds) {
  const imageKit = new ImageKit({
    publicKey,
    privateKey,
    urlEndpoint: `https://ik.imagekit.io/${imageKitId}/`,
  });

  const files = await imageKit.listFiles({
    limit: 100,
    sort: "DESC_UPDATED",
    path: "Trip_to_Schroeder_and_Grand_Marais",
  });

  return files.map(mapFile(imageKit));
}
