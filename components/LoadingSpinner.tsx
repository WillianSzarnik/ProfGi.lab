
import React from 'react';

export const LoadingSpinner: React.FC = () => {
    const message = 'Pesquisando...';

    return (
        <div className="loading">
            <div className="spinner"></div>
            <p>{message}</p>
        </div>
    );
};
