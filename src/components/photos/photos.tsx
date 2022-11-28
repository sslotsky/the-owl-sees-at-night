import {component$, useStylesScoped$, useSignal } from '@builder.io/qwik';
import { useLocation } from '@builder.io/qwik-city';
import { FileObject } from 'imagekit/dist/libs/interfaces';
import styles from './photos.css?inline';

interface Props {
  files: FileObject[];
  indexParam?: string;
}

export default component$((props: Props) => {
  useStylesScoped$(styles);
  const { indexParam = "viewing", files } = props;
  const loc = useLocation();
  const viewing = parseInt(loc.query[indexParam], 10);
  const isViewing = !isNaN(viewing);

  const imageUrl = useSignal(
    isViewing
      ? files[Math.abs(viewing % files.length)].url
      : undefined
    );

  const [prevUrl, nextUrl] = [new URL(loc.href), new URL(loc.href)];
  prevUrl.searchParams.set(indexParam, `${viewing - 1}`);
  nextUrl.searchParams.set(indexParam, `${viewing + 1}`);

  return (
    <div>
      {isViewing && (
        <>
          <img src={imageUrl.value} />
          <a href={prevUrl.toString()}>Prev</a>
          <a href={nextUrl.toString()}>Next</a>
        </>
      )}
      <div id="photos" data-url={imageUrl.value}>
        {props.files.map((f: FileObject) => (
          <img src={f.url} alt={f.name} />
        ))}
      </div>
    </div>
  )
});
