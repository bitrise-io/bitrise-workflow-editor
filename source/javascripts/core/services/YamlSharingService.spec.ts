import { bitriseYmlStore, initializeBitriseYmlDocument } from '@/core/stores/BitriseYmlStore';
import YmlUtils from '@/core/utils/YmlUtils';

import YamlSharingService from './YamlSharingService';

const YML = ['# kept', 'a: &a', '  k: 1', 'b: *a', 'c:', '  <<: *a', '  own: 2', ''].join('\n');

describe('YamlSharingService', () => {
  it('previews without changing anything, then applies exactly the preview as an unsaved edit', () => {
    initializeBitriseYmlDocument({ ymlString: YML, version: '1' });

    const { currentText, expandedText } = YamlSharingService.previewExpansion();
    expect(currentText).toBe(YML);
    expect(YmlUtils.toYml(bitriseYmlStore.getState().ymlDocument)).toBe(YML);

    expect(YamlSharingService.expand()).toEqual({ hasAliases: true, hasMergeKeys: true, hasAnchors: true });

    const { ymlDocument, savedYmlDocument } = bitriseYmlStore.getState();
    expect(YmlUtils.toYml(ymlDocument)).toBe(expandedText);
    expect(YmlUtils.toYml(savedYmlDocument)).toBe(YML);
  });
});
