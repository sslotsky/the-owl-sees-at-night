import { component$, useStylesScoped$ } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import { MasonryPhoto } from "~/trcp/router";
import Image from "~/components/image/image";
import styles from "./photos.css?inline";

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

  const [prevUrl, nextUrl, gridUrl] = [
    new URL(loc.href),
    new URL(loc.href),
    new URL(loc.href),
  ];
  prevUrl.searchParams.set(indexParam, `${viewing - 1}`);
  nextUrl.searchParams.set(indexParam, `${viewing + 1}`);
  gridUrl.searchParams.delete(indexParam);

  const getUrl = (n: number) => {
    const url = new URL(loc.href);
    url.searchParams.set(indexParam, n.toString());
    return url.toString();
  };

  return (
    <div>
      {isViewing ? (
        <div class="full">
          <Image photo={files.at(viewing % files.length)!} />
          <a class="prev" href={prevUrl.toString()}>
            &lsaquo;
          </a>
          <a class="close" href={gridUrl.toString()}>
            x
          </a>
          <a class="next" href={nextUrl.toString()}>
            &rsaquo;
          </a>
        </div>
      ) : (
        <div id="photos" data-viewing={isViewing}>
          {props.files.map((f: MasonryPhoto, index: number) => (
            <a href={getUrl(index)}>
              <img src={f.masonryUrl} alt={f.name} />
            </a>
          ))}
        </div>
      )}
    </div>
  );
});
