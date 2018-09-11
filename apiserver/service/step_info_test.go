package service

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	stepmanModels "github.com/bitrise-io/stepman/models"
	"github.com/stretchr/testify/require"
)

func TestPostStepInfoHandler(t *testing.T) {
	t.Log("invalid body - empty")
	{
		req, err := http.NewRequest("POST", "/api/step-info", nil)
		require.NoError(t, err)

		rr := httptest.NewRecorder()
		handler := http.HandlerFunc(PostStepInfoHandler)

		handler.ServeHTTP(rr, req)
		require.Equal(t, http.StatusBadRequest, rr.Code, rr.Body.String())

		var response Response
		require.NoError(t, json.Unmarshal(rr.Body.Bytes(), &response))

		require.Equal(t, "Empty body", response.ErrorMessage, rr.Body.String())
	}

	t.Log("invalid body - not a json")
	{
		reader := strings.NewReader("not a json")
		req, err := http.NewRequest("POST", "/api/step-info", reader)
		require.NoError(t, err)

		rr := httptest.NewRecorder()
		handler := http.HandlerFunc(PostStepInfoHandler)

		handler.ServeHTTP(rr, req)
		require.Equal(t, http.StatusBadRequest, rr.Code, rr.Body.String())

		var response Response
		require.NoError(t, json.Unmarshal(rr.Body.Bytes(), &response))

		require.Equal(t, "Failed to read request body, error: invalid character 'o' in literal null (expecting 'u')", response.ErrorMessage, rr.Body.String())
	}

	t.Log("library step")
	{
		body := PostStepInfoRequestBodyModel{
			Library: "https://github.com/bitrise-io/bitrise-steplib.git",
			ID:      "apk-info",
			Version: "1.0.4",
		}
		bytes, err := json.Marshal(body)
		require.NoError(t, err)

		reader := strings.NewReader(string(bytes))

		req, err := http.NewRequest("POST", "/api/step-info", reader)
		require.NoError(t, err)

		rr := httptest.NewRecorder()
		handler := http.HandlerFunc(PostStepInfoHandler)

		handler.ServeHTTP(rr, req)
		require.Equal(t, http.StatusOK, rr.Code, rr.Body.String())

		var stepInfo stepmanModels.StepInfoModel
		require.NoError(t, json.Unmarshal(rr.Body.Bytes(), &stepInfo))

		var expectedStepInfo stepmanModels.StepInfoModel
		require.NoError(t, json.Unmarshal([]byte(apkInfo104DefintiionJSON), &expectedStepInfo))

		expectedStepInfo.DefinitionPth = stepInfo.DefinitionPth
		require.Equal(t, expectedStepInfo, stepInfo)
	}

	t.Log("local step")
	{
		body := PostStepInfoRequestBodyModel{
			Library: "path",
			ID:      "./test-step",
			Version: "",
		}
		bytes, err := json.Marshal(body)
		require.NoError(t, err)

		reader := strings.NewReader(string(bytes))

		req, err := http.NewRequest("POST", "/api/step-info", reader)
		require.NoError(t, err)

		rr := httptest.NewRecorder()
		handler := http.HandlerFunc(PostStepInfoHandler)

		handler.ServeHTTP(rr, req)
		require.Equal(t, http.StatusOK, rr.Code, rr.Body.String())

		var stepInfo stepmanModels.StepInfoModel
		require.NoError(t, json.Unmarshal(rr.Body.Bytes(), &stepInfo))

		var expectedStepInfo stepmanModels.StepInfoModel
		require.NoError(t, json.Unmarshal([]byte(localStepDefinitionJSON), &expectedStepInfo))

		expectedStepInfo.DefinitionPth = stepInfo.DefinitionPth
		require.Equal(t, expectedStepInfo, stepInfo)
	}

	t.Log("git step")
	{
		body := PostStepInfoRequestBodyModel{
			Library: "git",
			ID:      "https://github.com/bitrise-steplib/steps-xamarin-user-management.git",
			Version: "1.0.3",
		}
		bytes, err := json.Marshal(body)
		require.NoError(t, err)

		reader := strings.NewReader(string(bytes))

		req, err := http.NewRequest("POST", "/api/step-info", reader)
		require.NoError(t, err)

		rr := httptest.NewRecorder()
		handler := http.HandlerFunc(PostStepInfoHandler)

		handler.ServeHTTP(rr, req)
		require.Equal(t, http.StatusOK, rr.Code, rr.Body.String())

		var stepInfo stepmanModels.StepInfoModel
		require.NoError(t, json.Unmarshal(rr.Body.Bytes(), &stepInfo))

		var expectedStepInfo stepmanModels.StepInfoModel
		require.NoError(t, json.Unmarshal([]byte(gitStepDefinitionJSON), &expectedStepInfo))

		expectedStepInfo.DefinitionPth = stepInfo.DefinitionPth
		require.Equal(t, expectedStepInfo, stepInfo)
	}
}

const gitStepDefinitionJSON = `{
	"library": "git",
	"id": "https://github.com/bitrise-steplib/steps-xamarin-user-management.git",
	"version": "1.0.3",
	"info": {},
	"step": {
		"title": "Xamarin User Management",
		"summary": "This step helps you authenticate your user with Xamarin and to download your Xamarin liceses.",
		"description": "This step helps you authenticate your user with Xamarin and to download your Xamarin licenses.",
		"website": "https://github.com/bitrise-steplib/steps-xamarin-user-management",
		"source_code_url": "https://github.com/bitrise-steplib/steps-xamarin-user-management",
		"support_url": "https://github.com/bitrise-steplib/steps-xamarin-user-management/issues",
		"host_os_tags": [
			"osx-10.10"
		],
		"project_type_tags": [
			"xamarin"
		],
		"is_requires_admin_user": false,
		"is_always_run": true,
		"is_skippable": false,
		"run_if": ".IsCI",
		"timeout": 0,
		"inputs": [
			{
				"build_slug": "$BITRISE_BUILD_SLUG",
				"opts": {
					"is_expand": true,
					"skip_if_empty": false,
					"title": "Bitrise build slug",
					"description": "Bitrise build slug\n",
					"summary": "",
					"is_sensitive":false,
					"category": "",
					"is_required": true,
					"is_dont_change_value": false,
					"is_template": false
				}
			},
			{
				"opts": {
					"is_expand": true,
					"skip_if_empty": false,
					"title": "Xamarin.iOS License",
					"description": "Set to yes if you want to download the Xamarin.iOS license file\n",
					"summary": "",
					"category": "",
					"is_sensitive":false,
					"value_options": [
						"yes",
						"no"
					],
					"is_required": true,
					"is_dont_change_value": false,
					"is_template": false
				},
				"xamarin_ios_license": "yes"
			},
			{
				"opts": {
					"is_expand": true,
					"skip_if_empty": false,
					"is_sensitive":false,
					"title": "Xamarin.Android License",
					"description": "Set to yes if you want to download the Xamarin.Android license file\n",
					"summary": "",
					"category": "",
					"value_options": [
						"yes",
						"no"
					],
					"is_required": true,
					"is_dont_change_value": false,
					"is_template": false
				},
				"xamarin_android_license": "yes"
			},
			{
				"opts": {
					"is_expand": true,
					"skip_if_empty": false,
					"is_sensitive":false,
					"title": "Xamarin.Mac License",
					"description": "Set to yes if you want to download the Xamarin.Mac license file\n",
					"summary": "",
					"category": "",
					"value_options": [
						"yes",
						"no"
					],
					"is_required": true,
					"is_dont_change_value": false,
					"is_template": false
				},
				"xamarin_mac_license": "no"
			}
		]
	}
}`

const localStepDefinitionJSON = `{
	"library": "path",
	"id": "./test-step",
	"info": {},
	"step": {
		"title": "STEP TEMPLATE",
		"summary": "A short summary of the step. Don't make it too long ;)",
		"description": "This is a Step template.\nContains everything what's required for a valid Stepman managed step.\n\nA Step's description (and generally any description property)\ncan be a [Markdown](https://en.wikipedia.org/wiki/Markdown) formatted text.\n\nTo create your own Step:\n\n1. Create a new repository on GitHub\n2. Copy the files from this folder into your repository\n3. That's all, you can use it on your own machine\n4. Once you're happy with it you can share it with others.",
		"website": "https://github.com/...",
		"source_code_url": "https://github.com/...",
		"support_url": "https://github.com/.../issues",
		"host_os_tags": [
			"osx-10.10"
		],
		"project_type_tags": [
			"ios",
			"android",
			"xamarin"
		],
		"type_tags": [
			"script"
		],
		"deps": {
			"brew": [
				{
					"name": "git"
				},
				{
					"name": "wget"
				}
			],
			"apt_get": [
				{
					"name": "git"
				},
				{
					"name": "wget"
				}
			]
		},
		"is_requires_admin_user": true,
		"is_always_run": false,
		"is_skippable": false,
		"run_if": "",
		"timeout": 0,
		"inputs": [
			{
				"example_step_input": "Default Value - you can leave this empty if you want to",
				"opts": {
					"is_expand": true,
					"skip_if_empty": false,
					"is_sensitive":false,
					"title": "Example Step Input",
					"description": "Description of this input.\n\nCan be Markdown formatted text.\n",
					"summary": "Summary. No more than 2-3 sentences.",
					"category": "",
					"is_required": true,
					"is_dont_change_value": false,
					"is_template": false
				}
			}
		],
		"outputs": [
			{
				"EXAMPLE_STEP_OUTPUT": null,
				"opts": {
					"is_expand": true,
					"skip_if_empty": false,
					"title": "Example Step Output",
					"is_sensitive":false,
					"description": "Description of this output.\n\nCan be Markdown formatted text.\n",
					"summary": "Summary. No more than 2-3 sentences.",
					"category": "",
					"is_required": false,
					"is_dont_change_value": false,
					"is_template": false
				}
			}
		]
	}
}`

const apkInfo104DefintiionJSON = `{
   "library":"https://github.com/bitrise-io/bitrise-steplib.git",
   "id":"apk-info",
   "version":"1.0.4",
   "latest_version":"1.4.1",
   "info":{

   },
   "step":{
      "title":"APK info",
      "summary":"APK Android info provider",
      "description":"Provides all possible Android APK information as package name, version name or version code.",
      "website":"https://github.com/thefuntasty/bitrise-step-apk-info",
      "source_code_url":"https://github.com/thefuntasty/bitrise-step-apk-info",
      "support_url":"https://github.com/thefuntasty/bitrise-step-apk-info/issues",
      "published_at":"2016-10-19T15:35:00.882498804+02:00",
      "source":{
         "git":"https://github.com/thefuntasty/bitrise-step-apk-info.git",
         "commit":"104e26a8800fc9363658b5837cf4747e5f26b032"
      },
      "asset_urls":{
         "icon.svg":"https://bitrise-steplib-collection.s3.amazonaws.com/steps/apk-info/assets/icon.svg"
      },
      "project_type_tags":[
         "android"
      ],
      "type_tags":[
         "android",
         "apk"
      ],
      "is_requires_admin_user":false,
      "is_always_run":false,
      "is_skippable":false,
      "run_if":"",
      "timeout":0,
      "inputs":[
         {
            "apk_path":"$BITRISE_APK_PATH",
            "opts":{
               "category":"",
               "description":"File path to APK file to get info from.\n",
			   "is_dont_change_value":false,
			   "is_sensitive":false,
               "is_expand":true,
               "is_required":true,
               "is_template":false,
               "skip_if_empty":false,
               "summary":"",
               "title":"APK file path"
            }
         }
      ],
      "outputs":[
         {
            "ANDROID_APP_PACKAGE_NAME":null,
            "opts":{
               "category":"",
               "description":"Android application package name, ex. com.package.my",
               "is_dont_change_value":false,
			   "is_expand":true,
			   "is_sensitive":false,
               "is_required":false,
               "is_template":false,
               "skip_if_empty":false,
               "summary":"",
               "title":"Android application package name"
            }
         },
         {
            "ANDROID_APK_FILE_SIZE":null,
            "opts":{
               "category":"",
               "description":"Android APK file size, in bytes",
               "is_dont_change_value":false,
			   "is_expand":true,
			   "is_sensitive":false,
               "is_required":false,
               "is_template":false,
               "skip_if_empty":false,
               "summary":"",
               "title":"Android APK file size"
            }
         },
         {
            "ANDROID_APP_NAME":null,
            "opts":{
               "category":"",
               "description":"Android application name from APK",
               "is_dont_change_value":false,
			   "is_expand":true,
			   "is_sensitive":false,
               "is_required":false,
               "is_template":false,
               "skip_if_empty":false,
               "summary":"",
               "title":"Android application name"
            }
         },
         {
            "ANDROID_APP_VERSION_NAME":null,
            "opts":{
               "category":"",
               "description":"Android application version name from APK, ex. 1.0.0",
               "is_dont_change_value":false,
			   "is_expand":true,
			   "is_sensitive":false,
               "is_required":false,
               "is_template":false,
               "skip_if_empty":false,
               "summary":"",
               "title":"Android application version name"
            }
         },
         {
            "ANDROID_APP_VERSION_CODE":null,
            "opts":{
               "category":"",
               "description":"Android application version code from APK, ex. 10",
               "is_dont_change_value":false,
               "is_expand":true,
			   "is_required":false,
			   "is_sensitive":false,
               "is_template":false,
               "skip_if_empty":false,
               "summary":"",
               "title":"Android application version code"
            }
         },
         {
            "ANDROID_ICON_PATH":null,
            "opts":{
               "category":"",
               "description":"File path to android application icon",
               "is_dont_change_value":false,
               "is_expand":true,
			   "is_required":false,
			   "is_sensitive":false,
               "is_template":false,
               "skip_if_empty":false,
               "summary":"",
               "title":"File path to icon"
            }
         }
      ]
   }
}`
