module github.com/bitrise-io/bitrise-workflow-editor

go 1.13

replace github.com/Sirupsen/logrus v1.4.2 => github.com/sirupsen/logrus v1.4.2

require (
	github.com/GeertJohan/go.rice v1.0.0
	github.com/bitrise-io/api-utils v0.0.0-20200323161256-ee41834663a4
	github.com/bitrise-io/bitrise v0.0.0-20200317124335-5f428f25413f
	github.com/bitrise-io/depman v0.0.0-20190402141727-e5c92c35cd92
	github.com/bitrise-io/envman v0.0.0-20200114121258-24a8f7287598
	github.com/bitrise-io/go-utils v0.0.0-20200224122728-e212188d99b4
	github.com/bitrise-io/stepman v0.0.0-20200225151805-15ac97d3ea15
	github.com/bitrise-io/workflow-editor-core v0.0.0-20200324151945-316b07ba7adb
	github.com/gorilla/mux v1.7.4
	github.com/satori/go.uuid v1.2.0
	github.com/spf13/cobra v0.0.6
	github.com/stretchr/testify v1.5.1
	gopkg.in/yaml.v2 v2.2.8
)
