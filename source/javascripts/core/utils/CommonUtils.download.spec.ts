/**
 * @jest-environment jsdom
 */
import { downloadYml } from './CommonUtils';

// jsdom's Blob has no `text()`.
function readText(blob: Blob) {
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsText(blob);
  });
}

describe('downloadYml', () => {
  let downloaded: { fileName: string; blob: Blob }[];

  beforeEach(() => {
    downloaded = [];
    const blobs = new Map<string, Blob>();
    URL.createObjectURL = jest.fn((blob: Blob) => {
      const url = `blob:${blobs.size}`;
      blobs.set(url, blob);
      return url;
    });
    jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function click(this: HTMLAnchorElement) {
      downloaded.push({ fileName: this.download, blob: blobs.get(this.href) as Blob });
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('downloads the content as YAML under the file name', async () => {
    downloadYml('workflows: {}\n', 'bitrise.yml');

    expect(downloaded).toHaveLength(1);
    expect(downloaded[0].fileName).toBe('bitrise.yml');
    expect(downloaded[0].blob.type).toBe('application/yaml;charset=utf-8');
    expect(await readText(downloaded[0].blob)).toBe('workflows: {}\n');
  });

  it('flattens folders into the file name, so same-named modules in different folders do not collide', () => {
    downloadYml('', 'modules/ios/workflows.yml');
    downloadYml('', 'modules/android/workflows.yml');

    expect(downloaded.map((file) => file.fileName)).toEqual([
      'modules-ios-workflows.yml',
      'modules-android-workflows.yml',
    ]);
  });
});
