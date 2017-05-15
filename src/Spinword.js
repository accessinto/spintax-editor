import React from 'react';
//import classNames from 'classnames';

export default ({ tooltipSelected, t, onClick }) => {
  const backgroundColor = tooltipSelected ? 'lightblue' : 'white';
  return (
    <span 
      style={{
        backgroundColor
      }}
      onClick={onClick}
    >
      {t}
    </span>
  );
  
};