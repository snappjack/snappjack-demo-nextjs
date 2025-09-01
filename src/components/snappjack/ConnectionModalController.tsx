'use client';

import { useConnectionStatus } from "@/contexts/ConnectionStatusContext";
import { ConnectionDetailsModal } from "./ConnectionDetailsModal";

export function ConnectionModalController() {
  const { 
    isConnectionModalOpen, 
    closeConnectionModal, 
    appName, 
    connectionData, 
    availableTools 
  } = useConnectionStatus();

  return (
    <ConnectionDetailsModal
      isOpen={isConnectionModalOpen}
      onClose={closeConnectionModal}
      appName={appName}
      connectionData={connectionData}
      availableTools={availableTools}
    />
  );
}