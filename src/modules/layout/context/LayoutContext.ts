import React from 'react';

interface LayoutContext {
    screenHeight?: number,
    screenWidth?: number,
    isMobile?: boolean
}

export default React.createContext<LayoutContext>({})