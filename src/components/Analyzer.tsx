import React, { useState, useEffect } from 'react';
import Draggable from 'react-draggable';
import styles from './Analyzer.module.css';

interface AnalysisResult {
  timeComplexity?: string;
  spaceComplexity?: string;
  explanation?: string;
  secondsLeft?: number;
}

interface CompanyTag {
  timesEncountered: number;
  slug: string;
  name: string;
}

interface CompanyTagsResult {
  three_months?: CompanyTag[];
  six_months?: CompanyTag[];
  more_than_six_months?: CompanyTag[];
  error?: string;
}

interface CompanyTag {
  timesEncountered: number;
  slug: string;
  name: string;
}

interface CompanyTagsResult {
  three_months?: CompanyTag[];
  six_months?: CompanyTag[];
  more_than_six_months?: CompanyTag[];
  error?: string;
}

const Analyzer: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 400, y: 100 });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [companyTagsResult, setCompanyTagsResult] = useState<CompanyTagsResult | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showCompanyTags, setShowCompanyTags] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const setInitialPosition = () => {
      const width = isCollapsed ? 120 : 320;
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
        const editorRect = editor.getBoundingClientRect();
        // Ensure the component stays within window boundaries
        const rightMargin = 40; // Margin from the right edge
        const safeX = Math.min(window.innerWidth - width - rightMargin, window.innerWidth - width - rightMargin);
        
        setPosition({
          x: safeX,
          y: editorRect.top
        });
      }
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
    const newWidth = newCollapsed ? 120 : 320;
    setIsCollapsed(newCollapsed);
    setPosition(pos => ({
      x: window.innerWidth - newWidth - 20,
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

  const getCompanyTags = async () => {
    setIsLoadingTags(true);
    setError(null);
    setCompanyTagsResult(null);

    try {
      // Get the current URL and encode it
      const currentUrl = encodeURIComponent(window.location.href);
      
      // Make the API call with the encoded URL as a GET parameter
      const res = await fetch(`http://localhost:8000/api/company-tags?url=${currentUrl}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setCompanyTagsResult({
        three_months: data.three_months || [],
        six_months: data.six_months || [],
        more_than_six_months: data.more_than_six_months || []
      });
      setShowCompanyTags(true);
    } catch (err) {
      setError('Failed to fetch company tags. Please try again.');
      setCompanyTagsResult({
        error: 'Failed to fetch company tags'
      });
    } finally {
      setIsLoadingTags(false);
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
              <img 
                src={chrome.runtime.getURL('icons/icon48.png')}
                alt="Analysis" 
                className={styles.collapsedIcon}
              />
              {!isCollapsed && (
                <div className={styles.buttonGroup}>
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
                  <button 
                    className={styles.companyTagsButton} 
                    onClick={getCompanyTags}
                    disabled={isLoadingTags}
                  >
                    {isLoadingTags ? (
                      <div className={styles.loader} />
                    ) : (
                      'Company Tags'
                    )}
                  </button>
                </div>
              )}
              <button
                className={styles.collapseButton}
                onClick={toggleCollapse}
                aria-label={isCollapsed ? 'Expand' : 'Collapse'}
              >
                {isCollapsed ? '◀' : '▶'}
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
                
                {companyTagsResult && (
                  <div className={styles.results}>
                    <button 
                      className={styles.explanationToggle}
                      onClick={() => setShowCompanyTags(!showCompanyTags)}
                    >
                      {showCompanyTags ? '▼ Hide' : '▶ Show'} Company Tags
                    </button>
                    {showCompanyTags && (
                      <div className={styles.companyTags}>
                        {companyTagsResult.error ? (
                          <div className={styles.error}>{companyTagsResult.error}</div>
                        ) : (
                          <div className={styles.tagsContainer}>
                            {hasCompanyTags(companyTagsResult) ? (
                              <>
                                {companyTagsResult.three_months && companyTagsResult.three_months.length > 0 && (
                                  <TagsSection 
                                    title="Last 3 Months" 
                                    tags={companyTagsResult.three_months} 
                                  />
                                )}
                                {companyTagsResult.six_months && companyTagsResult.six_months.length > 0 && (
                                  <TagsSection 
                                    title="Last 6 Months" 
                                    tags={companyTagsResult.six_months} 
                                  />
                                )}
                                {companyTagsResult.more_than_six_months && companyTagsResult.more_than_six_months.length > 0 && (
                                  <TagsSection 
                                    title="More than 6 Months" 
                                    tags={companyTagsResult.more_than_six_months} 
                                  />
                                )}
                              </>
                            ) : (
                              <div className={styles.noTags}>No company tags found for this problem.</div>
                            )}
                          </div>
                        )}
                      </div>
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

// Helper function to check if there are any company tags
const hasCompanyTags = (data: CompanyTagsResult): boolean => {
  return (
    (data.three_months !== undefined && data.three_months.length > 0) ||
    (data.six_months !== undefined && data.six_months.length > 0) ||
    (data.more_than_six_months !== undefined && data.more_than_six_months.length > 0)
  );
};

// Component to display a section of tags with a title
interface TagsSectionProps {
  title: string;
  tags: CompanyTag[];
}

const TagsSection: React.FC<TagsSectionProps> = ({ title, tags }) => {
  return (
    <div className={styles.tagsSection}>
      <h3 className={styles.tagsSectionTitle}>{title}</h3>
      <div className={styles.tagsList}>
        {tags.map((tag, index) => (
          <div key={tag.slug} className={styles.tag}>
            <span className={styles.tagName}>{tag.name}</span>
            <span className={styles.tagCount}>{tag.timesEncountered}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Analyzer;
