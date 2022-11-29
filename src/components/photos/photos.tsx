import {component$, useStylesScoped$, useSignal } from '@builder.io/qwik';
import { useLocation } from '@builder.io/qwik-city';
import { MasonryPhoto } from '~/trcp/router';
import styles from './photos.css?inline';

interface Props {
  files: MasonryPhoto[];
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
      ? files[Math.abs(viewing % files.length)].fullSizeUrl
      : undefined
    );

  const [prevUrl, nextUrl] = [new URL(loc.href), new URL(loc.href)];
  prevUrl.searchParams.set(indexParam, `${viewing - 1}`);
  nextUrl.searchParams.set(indexParam, `${viewing + 1}`);

  return (
    <div>
      {isViewing && (
        <div class="full">
          <img src={imageUrl.value} />
          <a class="prev" href={prevUrl.toString()}></a>
          <a class="next" href={nextUrl.toString()}></a>
        </div>
      )}
      <div id="photos" data-url={imageUrl.value}>
        {props.files.map((f: MasonryPhoto) => (
          <img src={f.masonryUrl} alt={f.name} />
        ))}
      </div>
    </div>
  )
});
