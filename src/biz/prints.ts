export type Material =
  | "Wrapped Canvas"
  | "Framed Canvas"
  | "Poster"
  | "Metal"
  | "Wood";

interface Print {
  width: number;
  height: number;
  material: Material;
}

function printSizes(material: Material) {
  const entries: Print[] = [];

  const sizes = {
    add: (width: number, height: number) => {
      entries.push({
        material,
        width,
        height,
      });

      return sizes;
    },
    list: () => entries,
  };

  return sizes;
}

const wood = () => printSizes("Wood");

export const woodPrints = wood()
  .add(5, 7)
  .add(8, 10)
  .add(10, 10)
  .add(11, 14)
  .list();
