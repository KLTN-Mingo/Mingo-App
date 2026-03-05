import React, { createContext, useContext, useState, ReactNode } from 'react';
type CameraContextType = {
  isCameraOpen: boolean;
  openCamera: () => void;
  closeCamera: () => void;
};

const CameraContext = createContext<CameraContextType | undefined>(undefined);

export const CameraProvider = ({ children }: { children: ReactNode }) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const openCamera = () => setIsCameraOpen(true);
  const closeCamera = () => setIsCameraOpen(false);

  return (
    <CameraContext.Provider value={{ isCameraOpen, openCamera, closeCamera }}>
      {children}
    </CameraContext.Provider>
  );
}
export const useCamera = () => {
  const context = useContext(CameraContext);
  if (!context) {
    throw new Error('useCamera must be used within a CameraProvider');
  }
  return context;
};