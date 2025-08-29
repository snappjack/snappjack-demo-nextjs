'use client';

import ToolbarButton from '../ui/ToolbarButton';
import {
  DocumentArrowDownIcon,
  FolderOpenIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useToolbarContext } from '../ToolbarContext';

export default function CanvasOperationsGroup() {
  const {
    onSave,
    onLoad,
    onClearAll,
    handleSave,
    handleLoadClick,
    handleClearAll,
    handleFileChange,
    fileInputRef
  } = useToolbarContext();
  if (!onSave && !onLoad && !onClearAll) {
    return null;
  }

  return (
    <>
      {onSave && (
        <ToolbarButton
          onClick={handleSave}
          tooltip="Save"
          title="Save canvas"
        >
          <DocumentArrowDownIcon className="w-5 h-5" />
        </ToolbarButton>
      )}
      
      {onLoad && (
        <ToolbarButton
          onClick={handleLoadClick}
          tooltip="Load"
          title="Load canvas"
        >
          <FolderOpenIcon className="w-5 h-5" />
        </ToolbarButton>
      )}
      
      {onClearAll && (
        <ToolbarButton
          onClick={handleClearAll}
          tooltip="Clear All"
          title="Clear all objects"
          variant="danger"
        >
          <TrashIcon className="w-5 h-5 text-red-600" />
        </ToolbarButton>
      )}

      {/* Hidden file input for load functionality */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
    </>
  );
}