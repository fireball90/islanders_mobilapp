import React, { useContext, useEffect } from 'react';
import HudContext from '../../contexts/HudContext';
import ManagementIsland from '../../components/management-island/ManagementIsland';

export default function Island() {
  const { setIsHudDisplayed } = useContext(HudContext);
  
  useEffect(() => {
    setIsHudDisplayed(true);
  }, [])

  return (
      <ManagementIsland />
    ) 
}

