import { BitkitTextArea } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { Stack } from '@chakra-ui/react/stack';
import { useEffect, useRef, useState } from 'react';

import { bitriseYmlStore, updateBitriseYmlDocumentByString } from '@/core/stores/BitriseYmlStore';
import YmlUtils from '@/core/utils/YmlUtils';

/** The store's document, editable, so a story can be driven from the YAML or from the rows. */
const YamlPanel = () => {
  const [draft, setDraft] = useState(() => YmlUtils.toYml(bitriseYmlStore.getState().ymlDocument));
  // Only follow the store while unfocused, or it reformats the text under the cursor.
  const isTypingRef = useRef(false);

  useEffect(
    () =>
      bitriseYmlStore.subscribe((state) => {
        if (!isTypingRef.current) {
          setDraft(YmlUtils.toYml(state.ymlDocument));
        }
      }),
    [],
  );

  const parseError = YmlUtils.toDoc(draft).errors[0]?.message;

  const handleChange = (value: string) => {
    setDraft(value);
    updateBitriseYmlDocumentByString(value);
  };

  return (
    <Stack gap="8" minWidth="320" flexShrink="0">
      <BitkitTextArea
        label="bitrise.yml"
        errorText={parseError}
        state={parseError ? 'error' : undefined}
        resize="vertical"
        textareaProps={{
          value: draft,
          rows: 20,
          spellCheck: false,
          style: { fontFamily: 'monospace' },
          onChange: (event) => handleChange(event.target.value),
          onFocus: () => {
            isTypingRef.current = true;
          },
          onBlur: () => {
            isTypingRef.current = false;
            setDraft(YmlUtils.toYml(bitriseYmlStore.getState().ymlDocument));
          },
        }}
      />
      <Box textStyle="body/sm/regular" color="text/secondary">
        Edits here write to the store, so the panel and the component under test stay in sync.
      </Box>
    </Stack>
  );
};

export default YamlPanel;
