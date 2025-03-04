import React, { useEffect, useState } from 'react';
import styles from './Popup.module.css';

const Popup: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    chrome.storage.sync.get(['enabled'], (result) => {
      setIsEnabled(result.enabled !== false);
    });
  }, []);

  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newState = event.target.checked;
    setIsEnabled(newState);
    chrome.storage.sync.set({ enabled: newState });
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <img src="../icons/icon48.png" className={styles.logo} alt="AlgoMeter AI logo" />
        <h1>AlgoMeter AI: Big O Insights for LeetCode</h1>
      </header>

      <div className={styles.toggleContainer}>
        <label className={styles.switch}>
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={handleToggle}
          />
          <span className={styles.slider}></span>
        </label>
        <span className={styles.toggleLabel}>Enable Extension</span>
      </div>

      <div className={styles.instructions}>
        <h2>How to Use</h2>
        <div className={styles.step}>
          <span className={styles.stepNumber}>1</span>
          <p>Go to any LeetCode problem page</p>
        </div>
        <div className={styles.step}>
          <span className={styles.stepNumber}>2</span>
          <p>The analyzer will appear on the right side of your code editor (drag it anywhere you like!)</p>
        </div>
        <div className={styles.step}>
          <span className={styles.stepNumber}>3</span>
          <p>Click "Analyze Complexity" to get time and space complexity analysis</p>
        </div>
        <div className={styles.step}>
          <span className={styles.stepNumber}>4</span>
          <p>Get instant Time/Space complexity insights!</p>
        </div>
      </div>

      <div className={styles.features}>
        <h2>Features</h2>
        <ul>
          <li>🚀 Instant time & space complexity analysis</li>
          <li>💡 Detailed explanations of the analysis</li>
          <li>🎯 Works with all LeetCode problems</li>
          <li>🔄 Real-time updates as you code</li>
        </ul>
      </div>

      <footer className={styles.footer}>
        <p>Created by <a href="mailto:raumild@gmail.com" className={styles.link}>Raumil Dhandhukia</a></p>
        <p className={styles.hiring}>
          Currently seeking Software Engineering opportunities!
        </p>
      </footer>
    </div>
  );
};

export default Popup;
