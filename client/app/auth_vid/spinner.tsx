// Spinner.tsx
import React from 'react';

interface SpinnerProps {
    className?: string; // Accept className as an optional prop
}

const Spinner: React.FC<SpinnerProps> = ({ className }) => {
    return (
        <div className={`loader ${className}`}>
            {/* Your spinner markup here */}
            <style jsx>{`
                .loader {
                    border: 8px solid rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    border-top: 8px solid #fff;
                    width: 40px;
                    height: 40px;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default Spinner;
