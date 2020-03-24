package service

import (
	"net/http"

	"encoding/json"

	"github.com/bitrise-io/go-utils/log"
	stepmanModels "github.com/bitrise-io/stepman/models"
	core "github.com/bitrise-io/workflow-editor-core"
)

// PostSpecRequestBodyModel ...
type PostSpecRequestBodyModel struct {
	Libraries []string `json:"libraries,omitempty"`
}

// PostSpecResponseModel ...
type PostSpecResponseModel struct {
	LibraryMap map[string]stepmanModels.StepCollectionModel `json:"library_map,omitempty"`
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
	libraryInfos, err := core.StepmanLocalLibraryInfos()
	if err != nil {
		log.Errorf(err.Error())
		RespondWithJSONBadRequestErrorMessage(w, err.Error())
		return
	}

	shouldReloadLocalLibraryInfos := false

	for _, libraryURI := range requestedLibraryURIs {
		isSetup := core.IsLibrarySetup(libraryURI, libraryInfos)

		if !isSetup {
			if err := core.StepmanSetupLibrary(libraryURI); err != nil {
				log.Errorf("Failed to setup library (%s), error: %s", libraryURI, err)
				RespondWithJSONBadRequestErrorMessage(w, "Failed to setup library (%s), error: %s", libraryURI, err)
				return
			}
			shouldReloadLocalLibraryInfos = true
		}
	}

	if shouldReloadLocalLibraryInfos {
		libraryInfos, err = core.StepmanLocalLibraryInfos()
		if err != nil {
			log.Errorf(err.Error())
			RespondWithJSONBadRequestErrorMessage(w, err.Error())
			return
		}
	}
	// --

	libraryMap := map[string]stepmanModels.StepCollectionModel{}

	if len(requestedLibraryURIs) == 0 {
		// If no library URI specified in the request, return all local library
		for _, libraryInfo := range libraryInfos {
			spec, err := core.LoadSpec(libraryInfo.SpecPath)
			if err != nil {
				log.Errorf("Failed to load spec of library (%s), error: %s", libraryInfo.URI, err)
				RespondWithJSONBadRequestErrorMessage(w, "Failed to load spec of library (%s), error: %s", libraryInfo.URI, err)
				return
			}

			libraryMap[libraryInfo.URI] = spec
		}
	} else {
		for _, libraryURI := range requestedLibraryURIs {
			info, found := core.LibraryInfo(libraryURI, libraryInfos)
			if !found {
				log.Errorf("Failed to find info of library (%s), error: %s", libraryURI, err)
				RespondWithJSONBadRequestErrorMessage(w, "Failed to find info of library (%s), error: %s", libraryURI, err)
				return
			}

			spec, err := core.LoadSpec(info.SpecPath)
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
