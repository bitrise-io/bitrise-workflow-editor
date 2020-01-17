describe("semverService", () => {
    var semverService;

    beforeEach(module("BitriseWorkflowEditor"));
    beforeEach(inject(function(_semverService_) {
        semverService = _semverService_;
    }));

    describe('shortenWildcardVersion', () => {
        it('should not touch general versions', () => {
            expect(semverService.shortenWildcardVersion('1.2.3')).toEqual('1.2.3');
        });

        it('should remove wildcard parts from version', () => {
            expect(semverService.shortenWildcardVersion('1.2.x')).toEqual('1.2');
            expect(semverService.shortenWildcardVersion('1.x.x')).toEqual('1');
        });

        it('should work for empty versions', () => {
            expect(semverService.shortenWildcardVersion()).toBeUndefined();
        });
    });

    describe('normalizeVersion', () => {
        it('should handle null versions', () => {
            expect(semverService.normalizeVersion()).toBeUndefined();
        });

        it('should not touch general versions', () => {
            expect(semverService.normalizeVersion('1.2.3')).toEqual('1.2.3');
        });

        it('should transform short versions to full wildcard form', () => {
            expect(semverService.normalizeVersion('1.2')).toEqual('1.2.x');
            expect(semverService.normalizeVersion('1')).toEqual('1.x.x');
        });
    });

    describe('extractWildcardVersions', () => {
        var mockVersions = ['0.1.1', '13.5.6', '1.2.3', '4.5.6', '0.2.3'];

        it('should extract wildcards collection from version list', () => {
            var wVersions = semverService.extractWildcardVersions(mockVersions);
            expect(wVersions).toEqual([
                '13.5.x', '13.x.x', '4.5.x',  '4.x.x', '1.2.x', '1.x.x', '0.2.x', '0.1.x', '0.x.x'
            ]);
        });

        it('should return empty list from empty list', () => {
            expect(semverService.extractWildcardVersions([])).toEqual([]);
            expect(semverService.extractWildcardVersions()).toBeUndefined();
        });
    });

    describe('resolveVersion', () => {
        var TEST_STEP_ID = 'mock_step';
        var mockCatalogue = {
            latestStepVersions: {
                'mock_step_2': '4.5.6',
                [TEST_STEP_ID]: '12.3.4'
            },
            steps: {
                [TEST_STEP_ID]: {
                    '12.3.4': '...',
                    '2.3.1': '...',
                    '1.3.1': '...',
                    '1.2.3': '...',
                    '0.2.3': '...',
                    '0.2.1': '...',
                    '0.1.1': '...',
                },
                'mock_step_2': {
                    '4.5.6': '...',
                    '2.3.4': '...',
                    '2.3.1': '...',
                    '1.3.1': '...',
                }
            }
        };

        var testCases = [
            ['0.2.1', '0.2.1'],
            ['0.2.x', '0.2.3'],
            ['1.x.x', '1.3.1'],
            ['x.x.x', '12.3.4'],
            ['12.x.x', '12.3.4'],
            ['1', '1.3.1'],         // partials should be interpreted as wildcards
            ['0', '0.2.3'],
            ['1.3', '1.3.1'],
        ];

        _.forEach(testCases, (testCase) => {
            it('should resolve ' + testCase[0] + ' to ' + testCase[1], () => {
                expect(semverService.resolveVersion(testCase[0], TEST_STEP_ID, mockCatalogue)).toEqual(testCase[1]);
            });
        });

        it('should use catalogue latest version if the input is none', () => {
            expect(semverService.resolveVersion(null, TEST_STEP_ID, mockCatalogue)).toEqual('12.3.4');
        });
    });
});