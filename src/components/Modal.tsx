import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: "999",
      }}
    >
      <div
        style={{
          background: "white",
          height: "auto",
          width: "auto",
          margin: "auto",
          padding: "2%",
          borderRadius: "10px",
          boxShadow: "2px solid black",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;
