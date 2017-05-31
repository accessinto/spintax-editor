import React from 'react';
//import classNames from 'classnames';

export default ({ tooltipSelected, t, onClick }) => {
  const backgroundColor = tooltipSelected ? 'lightblue' : 'white';
  return (
    <span 
      style={{
        backgroundColor
      }}
      data-index={t.i}
      onClick={onClick}
      className="sw"
    >
      {t.t}
    </span>
  );
  
};