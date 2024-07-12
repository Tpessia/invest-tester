import variables from '@/styles/variables';
import React from 'react';
import AceEditor, { IAceEditorProps } from 'react-ace';

import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-twilight';

interface Props extends IAceEditorProps {}

const CodeEditor: React.FC<Props> = (props) => {
  const { style, editorProps, ...rest } = props;

  const nativeStyle: React.CSSProperties = {
    width: '100%',
    border: `5px solid ${variables.bodySecundary}`
  };

  // const themes = ['ambiance','chaos','clouds_midnight','dracula','cobalt','gruvbox','gob','idle_fingers','kr_theme','merbivore','merbivore_soft','mono_industrial','monokai','pastel_on_dark','solarized_dark','terminal','tomorrow_night','tomorrow_night_blue','tomorrow_night_bright','tomorrow_night_eighties','twilight','vibrant_ink'];

  return (
    <AceEditor
      style={{ ...nativeStyle, ...style }}
      mode='javascript'
      theme='twilight'
      editorProps={{ ...editorProps, $blockScrolling: true }}
      showPrintMargin={false}
      setOptions={{ useWorker: false, tabSize: 2, useSoftTabs: true }}
      {...rest}
    />
  );
};

export default CodeEditor;