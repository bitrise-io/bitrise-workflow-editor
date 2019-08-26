package envutil

import (
	"os"
	"testing"

	"github.com/bitrise-io/go-utils/pointers"
	"github.com/stretchr/testify/require"
)

func TestSetenvForFunction(t *testing.T) {
	// set an original value
	testKey := "KEY_SetenvForFunction"
	require.NoError(t, os.Setenv(testKey, "orig value"))

	// quick test it
	require.EqualValues(t, "orig value", os.Getenv(testKey))

	// now apply another value, but just for the function
	setEnvErr := SetenvForFunction(testKey, "temp value", func() {
		require.EqualValues(t, "temp value", os.Getenv(testKey))
	})
	require.NoError(t, setEnvErr)

	// should be the original value again
	require.EqualValues(t, "orig value", os.Getenv(testKey))
}

func TestSetenvsForFunction(t *testing.T) {
	// set an original value
	testKey1 := "KEY_SetenvsForFunction1"
	require.NoError(t, os.Setenv(testKey1, "orig value 1"))
	testKey2 := "KEY_SetenvsForFunction2"
	require.NoError(t, os.Setenv(testKey2, "orig value 2"))

	// quick test it
	require.EqualValues(t, "orig value 1", os.Getenv(testKey1))
	require.EqualValues(t, "orig value 2", os.Getenv(testKey2))

	// now apply another value, but just for the function
	setEnvErr := SetenvsForFunction(map[string]string{testKey1: "temp value 1", testKey2: "temp value 2"}, func() {
		require.EqualValues(t, "temp value 1", os.Getenv(testKey1))
		require.EqualValues(t, "temp value 2", os.Getenv(testKey2))
	})
	require.NoError(t, setEnvErr)

	// should be the original value again
	require.EqualValues(t, "orig value 1", os.Getenv(testKey1))
	require.EqualValues(t, "orig value 2", os.Getenv(testKey2))
}

func TestRevokableSetenv(t *testing.T) {
	// set an original value
	testKey := "KEY_RevokableSetenv"
	require.NoError(t, os.Setenv(testKey, "RevokableSetenv orig value"))

	// quick test it
	require.EqualValues(t, "RevokableSetenv orig value", os.Getenv(testKey))

	// revokable set
	revokeFn, err := RevokableSetenv(testKey, "revokable value")
	require.NoError(t, err)

	// env should now be the changed value
	require.EqualValues(t, "revokable value", os.Getenv(testKey))

	// revoke it
	require.NoError(t, revokeFn())

	// should be the original value again
	require.EqualValues(t, "RevokableSetenv orig value", os.Getenv(testKey))
}

func TestRevokableSetenvs(t *testing.T) {
	// set the original values
	testKey1 := "KEY_RevokableSetenvs1"
	testKey2 := "KEY_RevokableSetenvs2"
	require.NoError(t, os.Setenv(testKey1, "RevokableSetenvs orig value 1"))
	require.NoError(t, os.Setenv(testKey2, "RevokableSetenvs orig value 2"))

	// quick test
	require.EqualValues(t, "RevokableSetenvs orig value 1", os.Getenv(testKey1))
	require.EqualValues(t, "RevokableSetenvs orig value 2", os.Getenv(testKey2))

	// revokable set them
	revokeFn, err := RevokableSetenvs(map[string]string{testKey1: "revokable value 1", testKey2: "revokable value 2"})
	require.NoError(t, err)

	// envs should now have the changed values
	require.EqualValues(t, "revokable value 1", os.Getenv(testKey1))
	require.EqualValues(t, "revokable value 2", os.Getenv(testKey2))

	// revoke them
	require.NoError(t, revokeFn())

	// should be the original values again
	require.EqualValues(t, "RevokableSetenvs orig value 1", os.Getenv(testKey1))
	require.EqualValues(t, "RevokableSetenvs orig value 2", os.Getenv(testKey2))
}

func TestStringFlagOrEnv(t *testing.T) {
	testEnvKey := "KEY_TestStringFlagOrEnv"

	revokeFn, err := RevokableSetenv(testEnvKey, "env value")
	require.NoError(t, err)
	defer func() {
		require.NoError(t, revokeFn())
	}()

	// quick test it
	require.EqualValues(t, "env value", os.Getenv(testEnvKey))

	// flag provided - value should be that
	require.Equal(t, "flag value", StringFlagOrEnv(pointers.NewStringPtr("flag value"), testEnvKey))

	// flag not provided - value should be the env's value
	require.Equal(t, "env value", StringFlagOrEnv(nil, testEnvKey))

	// flag provided but empty string - value should be the env's value, it's the same as a nil flag
	require.Equal(t, "env value", StringFlagOrEnv(pointers.NewStringPtr(""), testEnvKey))
}

func TestGetenvWithDefault(t *testing.T) {
	testEnvKey := "KEY_TestGetenvWithDefault"

	// no env set yet, return with default
	require.Equal(t, "default value", GetenvWithDefault(testEnvKey, "default value"))

	// set the env
	revokeFn, err := RevokableSetenv(testEnvKey, "env value")
	require.NoError(t, err)
	defer func() {
		require.NoError(t, revokeFn())
	}()

	// env set - value should be the env's value
	require.Equal(t, "env value", GetenvWithDefault(testEnvKey, "default value"))
}

func TestRequiredEnv(t *testing.T) {
	testEnvKey := "KEY_TestRequiredEnv"

	t.Log("When the env isn't set")
	{
		envVal, err := RequiredEnv(testEnvKey)
		require.EqualError(t, err, "required environment variable (KEY_TestRequiredEnv) not provided")
		require.Equal(t, "", envVal)
	}

	// set the env
	revokeFn, err := RevokableSetenv(testEnvKey, "Test KEY_TestRequiredEnv value")
	require.NoError(t, err)
	defer func() {
		require.NoError(t, revokeFn())
	}()

	t.Log("When the env is set")
	{
		envVal, err := RequiredEnv(testEnvKey)
		require.NoError(t, err)
		require.Equal(t, "Test KEY_TestRequiredEnv value", envVal)
	}
}
