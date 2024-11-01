// Modal.tsx
import React from 'react';

interface ModalProps {
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ onClose, title, children }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>{title}</h2>
                <button onClick={onClose} className="close-btn">Close</button>
                {children}
            </div>
            <style jsx>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .modal-content {
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    width: 300px;
                    text-align: center;
                }
                .close-btn {
                    margin-top: 10px;
                    padding: 5px 10px;
                    border: none;
                    background: #3498db; /* Blue */
                    color: white;
                    border-radius: 4px;
                    cursor: pointer;
                }
                .close-btn:hover {
                    background: #2980b9; /* Darker blue */
                }
            `}</style>
        </div>
    );
};

export default Modal;
