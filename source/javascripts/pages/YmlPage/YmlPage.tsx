import { Box } from '@chakra-ui/react';
import { BitriseYmlSettings } from '@/core/models/BitriseYmlSettings';
import YmlEditor from './components/YmlEditor';
import YmlEditorHeader from './components/YmlEditorHeader';

type YmlPageProps = {
  ciConfigYml: string;
  onConfigSourceChangeSaved: (usesRepositoryYml: boolean, ymlRootPath: string) => void;
  onEditorChange: (changedText?: string) => void;
  isEditorLoading: boolean;
  ymlSettings: BitriseYmlSettings;
};

const YmlPage = (props: YmlPageProps) => {
  const { ciConfigYml, isEditorLoading, onConfigSourceChangeSaved, onEditorChange, ymlSettings } = props;

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <YmlEditorHeader
        ciConfigYml={ciConfigYml}
        onConfigSourceChangeSaved={onConfigSourceChangeSaved}
        ymlSettings={ymlSettings}
      />
      <Box flexGrow="1" flexShrink="1" borderRadius="8" paddingBlock="12" backgroundColor="#1e1e1e">
        <YmlEditor
          ciConfigYml={ciConfigYml}
          isLoading={isEditorLoading}
          readOnly={ymlSettings.usesRepositoryYml}
          onEditorChange={onEditorChange}
        />
      </Box>
    </Box>
  );
};

export default YmlPage;
