import 'reflect-metadata';

import { AssetDataService } from '@/modules/asset-data/services/AssetDataService';
import { assetData } from '@/tests/test-data';
import { anything, spy, when } from 'ts-mockito';
import { container } from 'tsyringe';
import { afterEach, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';

const dom = new JSDOM(undefined, { url: 'http://localhost/', runScripts: 'dangerously', resources: 'usable' });
global.document = dom.window.document;
global.window = dom.window as any;

beforeEach(() => {
  const mockAssetDataService = () => {
    const instance = new AssetDataService();
    const mock: AssetDataService = spy(instance);
    when(mock.get(anything(), anything(), anything())).thenCall(async (id, start, end) => Promise.resolve(assetData()));
    return instance;
  };
  container.registerInstance(AssetDataService, mockAssetDataService());
});

afterEach(() => {
  // Do something here
});
