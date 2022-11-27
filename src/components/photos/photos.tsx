import {component$, useStylesScoped$ } from '@builder.io/qwik';
import { FileObject } from 'imagekit/dist/libs/interfaces';
import styles from './photos.css?inline';

interface Props {
  files: FileObject[];
}

export default component$((props: Props) => {
  useStylesScoped$(styles);

  return (
    <div id="photos">
      {props.files.map((f: FileObject) => (
        <img src={f.url} alt={f.name} />
      ))}
    </div>
  )
});
