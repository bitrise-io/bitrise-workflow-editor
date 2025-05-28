import { updateBitriseYmlDocumentByString } from '../stores/BitriseYmlStore';
import BitriseYmlService from './BitriseYmlService';

describe('BitriseYmlService', () => {
  describe('getUniqueStepIds', () => {
    it('should return unique step IDs from the workflows', () => {
      updateBitriseYmlDocumentByString(yaml`
        workflows:
          workflow1:
            steps:
              - step1: {}
              - step2: {}
              - bundle::sb1: {}
          workflow2:
            steps:
              - step1: {}
              - step4: {}
              - with:
                  steps:
                  - step6: {}
                  - step7: {}
              - step8: {}
        step_bundles:
          sb1:
            steps:
              - step3: {}
              - step4: {}
              - step5: {}`);

      expect(BitriseYmlService.getUniqueStepIds()).toEqual([
        'step1',
        'step2',
        'step3',
        'step4',
        'step5',
        'step6',
        'step7',
        'step8',
      ]);
    });
  });

  describe('getUniqueStepCvss', () => {
    it('should return unique step CVSS from the workflows', () => {
      updateBitriseYmlDocumentByString(yaml`
        workflows:
          workflow1:
            steps:
              - step1: {}
              - step2: {}
              - bundle::sb1: {}
          workflow2:
            steps:
              - step1@2: {}
              - step4@2: {}
              - with:
                  steps:
                  - step6: {}
                  - step7@2: {}
              - step8: {}
        step_bundles:
          sb1:
            steps:
              - step3: {}
              - step4: {}
              - step5: {}`);

      expect(BitriseYmlService.getUniqueStepCvss()).toEqual([
        'step1',
        'step2',
        'step3',
        'step4',
        'step5',
        'step1@2',
        'step4@2',
        'step6',
        'step7@2',
        'step8',
      ]);
    });
  });
});
