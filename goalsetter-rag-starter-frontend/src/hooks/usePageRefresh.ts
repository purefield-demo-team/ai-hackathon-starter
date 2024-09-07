import React, { useEffect, useState } from 'react';

export function usePageRefresh() {
    const [refreshKey, setRefreshKey] = useState(0);
  
    useEffect(() => {
      setRefreshKey((prevKey) => prevKey + 1);
    }, [window.performance.navigation.type === 1]);
  
    return refreshKey;
  }
  