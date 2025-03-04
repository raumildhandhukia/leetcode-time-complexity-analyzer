import React, { useState, useEffect } from 'react';
import Draggable from 'react-draggable';
import styles from './Analyzer.module.css';

interface AnalysisResult {
  timeComplexity?: string;
  spaceComplexity?: string;
  explanation?: string;
  secondsLeft?: number;
}

const Analyzer: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
    setPosition(pos => ({
      x: pos.x + (newCollapsed ? 260 : -260),
      y: pos.y
    }));
  };

  const getLeetCodeEditorValue = (): string | null => {
    let editor = document.querySelector('.monaco-editor');
    
    if (!editor) {
      const iframes = document.querySelectorAll('iframe');
      for (const iframe of iframes) {
        try {
          const iframeEditor = iframe.contentDocument?.querySelector('.monaco-editor');
          if (iframeEditor) {
            editor = iframeEditor;
            break;
          }
        } catch (e) {
          console.log('Cannot access iframe content due to same-origin policy');
        }
      }
    }

    if (editor) {
      const codeElement = editor.querySelector('.view-lines');
      if (codeElement) {
        return codeElement.textContent || null;
      }
    }

    if ((window as any).monaco?.editor?.getModels) {
      const models = (window as any).monaco.editor.getModels();
      if (models.length > 0) {
        return models[0].getValue();
      }
    }

    return null;
  };

  const analyzeCode = async () => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    const code = getLeetCodeEditorValue();
    if (!code) {
      setError('No code found in editor');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('https://big-o-insights-back.vercel.app/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code_snippet: code
        })
      });

      const data = await res.json();
      
      if (res.status === 429) {
        setCountdown(data.seconds_left);
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev === null || prev <= 1) {
              clearInterval(timer);
              return null;
            }
            return prev - 1;
          });
        }, 1000);
        return;
      }

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const { response } = data;
      setAnalysisResult({
        timeComplexity: response.time_complexity,
        spaceComplexity: response.space_complexity,
        explanation: response.explanation
      });
    } catch (err) {
      setError('Failed to analyze code. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
            <div className={`${styles.handle}`}>
              <div className={styles.dragHandle}>⠿</div>
              {!isCollapsed && (
                <button 
                  className={styles.analyzeButton} 
                  onClick={analyzeCode}
                  disabled={isLoading || countdown !== null}
                >
                  {isLoading ? (
                    <div className={styles.loader} />
                  ) : countdown ? (
                    `Wait ${countdown}s`
                  ) : (
                    'Analyze Complexity'
                  )}
                </button>
              )}
              <button
                className={styles.collapseButton}
                onClick={toggleCollapse}
                aria-label={isCollapsed ? 'Expand' : 'Collapse'}
              >
                {isCollapsed ? '▶' : '◀'}
              </button>
            </div>

            {!isCollapsed && (
              <div className={styles.content}>
                {error && (
                  <div className={styles.error}>{error}</div>
                )}

                {analysisResult && (
                  <div className={styles.results}>
                    <div className={styles.complexity}>
                      <strong>Time</strong>
                      <span>{analysisResult.timeComplexity}</span>
                    </div>
                    <div className={styles.complexity}>
                      <strong>Space</strong>
                      <span>{analysisResult.spaceComplexity}</span>
                    </div>
                    {analysisResult.explanation && (
                      <>
                        <button 
                          className={styles.explanationToggle}
                          onClick={() => setShowExplanation(!showExplanation)}
                        >
                          {showExplanation ? '▼ Hide' : '▶ Show'} Explanation
                        </button>
                        {showExplanation && (
                          <div className={styles.explanation}>
                            {analysisResult.explanation}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Draggable>
    </div>
  );
};

export default Analyzer;
