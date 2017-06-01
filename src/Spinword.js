import React from 'react';
//import classNames from 'classnames';

export default ({ tooltipSelected, t, onClick }) => {
  const backgroundColor = tooltipSelected ? 'lightblue' : 'white';
  return (
    <span 
      style={{
        backgroundColor
      }}
      data-type={t.type}
      data-start={t.start}
      data-end={t.end}
      data-length={t.length}
      data-id={t.id}
      onClick={onClick}
      className="sw"
    >
      {t.t}
    </span>
  );
  
};