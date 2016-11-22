describe("displayNameForProvProfile", function() {

    var $filter;
    var ProvProfile;
    var provProfile;

    beforeEach(module("BitriseWorkflowEditor"));
    beforeEach(inject(function (_$filter_, _ProvProfile_) {
        $filter = _$filter_;
        ProvProfile = _ProvProfile_;
        provProfile = new ProvProfile();
    }));

    it("should return filename without extension", function() {
        provProfile.expiringDownloadURL = "https://www.bitrise.io/red-profile.mobileprovision";
        expect($filter("displayNameForProvProfile")(provProfile)).toBe("red-profile.mobileprovision");

        provProfile.expiringDownloadURL = "https://www.bitrise.io/red-profile.provisionprofile";
        expect($filter("displayNameForProvProfile")(provProfile)).toBe("red-profile.provisionprofile");

        provProfile.expiringDownloadURL = "red-profile.mobileprovision";
        expect($filter("displayNameForProvProfile")(provProfile)).toBe("red-profile.mobileprovision");

        provProfile.expiringDownloadURL = "https://www.bitrise.io/red-profile.mobileprovision#other_params";
        expect($filter("displayNameForProvProfile")(provProfile)).toBe("red-profile.mobileprovision");
    });

    it("should return 'No title for Provisioning Profile'", function() {
        provProfile.expiringDownloadURL = "https://www.bitrise.io/red-profile.mobileprov";
        expect($filter("displayNameForProvProfile")(provProfile)).toBe("No title for Provisioning Profile");

        provProfile.expiringDownloadURL = "https://www.bitrise.io/red-profile";
        expect($filter("displayNameForProvProfile")(provProfile)).toBe("No title for Provisioning Profile");
    });

});
