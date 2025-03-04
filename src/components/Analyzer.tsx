import React, { useState, useEffect } from 'react';
import Draggable from 'react-draggable';
import styles from './Analyzer.module.css';

const Analyzer: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Set initial position to right side of window
    const setInitialPosition = () => {
      const width = isCollapsed ? 50 : 320;
      setPosition({
        x: Math.max(0, window.innerWidth - width - 20),
        y: 100
      });
    };

    setInitialPosition();
    window.addEventListener('resize', setInitialPosition);
    return () => window.removeEventListener('resize', setInitialPosition);
  }, [isCollapsed]);

  const handleDrag = (_e: any, data: { x: number; y: number }) => {
    setPosition({ x: data.x, y: data.y });
  };

  const toggleCollapse = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    
    // When expanding, move left by 260px (300px - 40px)
    // When collapsing, move right by 260px
    setPosition(pos => ({
      x: pos.x + (newCollapsed ? 260 : -260),
      y: pos.y
    }));
  };

  return (
    <div className={styles.wrapper}>
      <Draggable
        handle={`.${styles.handle}`}
        position={position}
        onDrag={handleDrag}
        bounds="parent"
      >
        <div className={`${styles.container} ${isCollapsed ? styles.collapsed : styles.expanded}`}>
          <div className={styles.mainContent}>
            <div className={`${styles.handle} ${isCollapsed ? styles.collapsed : ''}`}>
              🕒 Time Analyzer
            </div>
            <div className={`${styles.content} ${isCollapsed ? styles.collapsed : ''}`}>
              <p>Analyzing time complexity...</p>
              <p className={styles.hint}>
                Drag from the header to move
              </p>
            </div>
          </div>
          <button
            className={`${styles.collapseButton} ${isCollapsed ? '' : styles.expanded}`}
            onClick={toggleCollapse}
            title={isCollapsed ? "Expand" : "Collapse"}
          >
            {isCollapsed ? '⟩' : '⟨'}
          </button>
        </div>
      </Draggable>
    </div>
  );
};

export default Analyzer;
