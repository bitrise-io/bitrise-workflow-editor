package service

import (
	"net/http"

	"encoding/json"

	"fmt"

	"github.com/bitrise-io/bitrise-workflow-editor/apiserver/tools"
	"github.com/bitrise-io/depman/pathutil"
	"github.com/bitrise-io/go-utils/fileutil"
	"github.com/bitrise-io/go-utils/log"
	stepmanModels "github.com/bitrise-io/stepman/models"
)

// PostSpecRequestBodyModel ...
type PostSpecRequestBodyModel struct {
	Libraries []string `json:"libraries,omitempty"`
}

// PostSpecResponseModel ...
type PostSpecResponseModel struct {
	LibraryMap map[string]stepmanModels.StepCollectionModel `json:"library_map,omitempty"`
}

func loadSpec(specPth string) (stepmanModels.StepCollectionModel, error) {
	if exist, err := pathutil.IsPathExists(specPth); err != nil {
		return stepmanModels.StepCollectionModel{}, fmt.Errorf("failed to check if spec exists at: %s, error: %s", specPth, err)
	} else if !exist {
		return stepmanModels.StepCollectionModel{}, fmt.Errorf("spec not exists at: %s", specPth)
	}

	specBytes, err := fileutil.ReadBytesFromFile(specPth)
	if err != nil {
		return stepmanModels.StepCollectionModel{}, fmt.Errorf("failed to read spec at: %s, error: %s", specPth, err)
	}

	var spec stepmanModels.StepCollectionModel
	if err := json.Unmarshal(specBytes, &spec); err != nil {
		return stepmanModels.StepCollectionModel{}, fmt.Errorf("failed to serialize spec, error: %s", err)
	}

	return spec, nil
}

func isLibrarySetup(libraryURI string, libraryInfos []stepmanModels.SteplibInfoModel) bool {
	for _, libraryInfo := range libraryInfos {
		if libraryInfo.URI == libraryURI {
			return true
		}
	}
	return false
}

func libraryInfo(URI string, infos []stepmanModels.SteplibInfoModel) (stepmanModels.SteplibInfoModel, bool) {
	for _, info := range infos {
		if info.URI == URI {
			return info, true
		}
	}
	return stepmanModels.SteplibInfoModel{}, false
}

// PostSpecHandler ...
func PostSpecHandler(w http.ResponseWriter, r *http.Request) {
	requestedLibraryURIs := []string{}

	if r.Body != nil {
		var requestBody PostSpecRequestBodyModel
		decoder := json.NewDecoder(r.Body)
		if err := decoder.Decode(&requestBody); err != nil {
			log.Errorf("Failed to read request body, error: %s", err)
			RespondWithJSONBadRequestErrorMessage(w, "Failed to read request body, error: %s", err)
			return
		}

		requestedLibraryURIs = requestBody.Libraries
	}

	// Ensure requested libraries are setup locally
	libraryInfos, err := tools.StepmanLocalLibraryInfos()
	if err != nil {
		log.Errorf(err.Error())
		RespondWithJSONBadRequestErrorMessage(w, "%s", err.Error())
		return
	}

	shouldReloadLocalLibraryInfos := false

	for _, libraryURI := range requestedLibraryURIs {
		isSetup := isLibrarySetup(libraryURI, libraryInfos)

		if !isSetup {
			if err := tools.StepmanSetupLibrary(libraryURI); err != nil {
				log.Errorf("Failed to setup library (%s), error: %s", libraryURI, err)
				RespondWithJSONBadRequestErrorMessage(w, "Failed to setup library (%s), error: %s", libraryURI, err)
				return
			}
			shouldReloadLocalLibraryInfos = true
		}
	}

	if shouldReloadLocalLibraryInfos {
		libraryInfos, err = tools.StepmanLocalLibraryInfos()
		if err != nil {
			log.Errorf(err.Error())
			RespondWithJSONBadRequestErrorMessage(w, "%s", err.Error())
			return
		}
	}
	// --

	libraryMap := map[string]stepmanModels.StepCollectionModel{}

	if len(requestedLibraryURIs) == 0 {
		// If no library URI specified in the request, return all local library
		for _, libraryInfo := range libraryInfos {
			spec, err := loadSpec(libraryInfo.SpecPath)
			if err != nil {
				log.Errorf("Failed to load spec of library (%s), error: %s", libraryInfo.URI, err)
				RespondWithJSONBadRequestErrorMessage(w, "Failed to load spec of library (%s), error: %s", libraryInfo.URI, err)
				return
			}

			libraryMap[libraryInfo.URI] = spec
		}
	} else {
		for _, libraryURI := range requestedLibraryURIs {
			info, found := libraryInfo(libraryURI, libraryInfos)
			if !found {
				log.Errorf("Failed to find info of library (%s), error: %s", libraryURI, err)
				RespondWithJSONBadRequestErrorMessage(w, "Failed to find info of library (%s), error: %s", libraryURI, err)
				return
			}

			spec, err := loadSpec(info.SpecPath)
			if err != nil {
				log.Errorf("Failed to load spec of library (%s), error: %s", libraryURI, err)
				RespondWithJSONBadRequestErrorMessage(w, "Failed to load spec of library (%s), error: %s", libraryURI, err)
				return
			}

			libraryMap[libraryURI] = spec
		}
	}

	response := PostSpecResponseModel{
		LibraryMap: libraryMap,
	}

	RespondWithJSON(w, http.StatusOK, response)
}
