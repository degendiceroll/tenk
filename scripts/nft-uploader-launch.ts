import { File, NFTStorage } from "nft.storage";
import * as fs from "fs/promises";
import * as path from "path";
import { API_TOKEN } from "../api_token";

declare interface File {
  _parts: any[];
}

function here(s = ""): string {
  return path.join(__dirname, "../assets/test_assets/images", s);
}

const id_regex = /^(?<id>[0-9]+)/;

async function getInfo(file: string): Promise<{ id: string; info: any }> {
  const id_ = file.match(id_regex).groups.id;
  const json_ = (
    await fs.readFile(
      path.join(__dirname, "../assets/test_assets/jsons", `${id_}.json`)
    )
  ).toString();
  return {
    id: id_,
    info: json_,
  };
}

async function parseFiles(): Promise<typeof File[][]> {
  const directory = await fs.readdir(here());
  const files = await Promise.all(
    directory.map(async (file) => {
      const { id, info } = await getInfo(file);
      console.log(id, info);
      return [
        new File([await fs.readFile(here(file))], `${id}.png`),
        new File([info], `${id}.json`),
      ];
    })
  );

  return files;
}

async function main() {
  const initialFiles = await parseFiles();
  // return;
  const client = new NFTStorage({ token: API_TOKEN });
  // const numOfFiles = initialFiles.length;
  // for (let i = numOfFiles; i < 10_000; i++) {
  //   const idx = i % 10;
  //   const [media, info] = initialFiles[idx];
  //   const newFile = [
  //     // @ts-ignore
  //     new File(media._parts, `${i}.png`),
  //     // @ts-ignore
  //     new File(info._parts, `${i}.json`),
  //   ];
  //   initialFiles.push(newFile);
  // }

  const CID = await client.storeDirectory(initialFiles.flat());
  console.log(CID);
}

void main();
