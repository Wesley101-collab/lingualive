import { useState, useEffect } from 'react';
import styles from './OnboardingTour.module.css';

interface TourStep {
  target: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const SPEAKER_TOUR: TourStep[] = [
  {
    target: '.mic-button',
    title: 'Start Speaking',
    content: 'Click this button to start recording. Your speech will be transcribed in real-time.',
    position: 'bottom',
  },
  {
    target: '.share-link',
    title: 'Share with Viewers',
    content: 'Copy this link and share it with your audience. They can view captions in their preferred language.',
    position: 'bottom',
  },
  {
    target: '.save-button',
    title: 'Save Your Session',
    content: 'Save your transcript to history for later review or export.',
    position: 'top',
  },
];

const VIEWER_TOUR: TourStep[] = [
  {
    target: '.language-select',
    title: 'Choose Your Language',
    content: 'Select your preferred language. Captions will be translated automatically.',
    position: 'bottom',
  },
  {
    target: '.listen-mode',
    title: 'Listen Mode',
    content: 'Enable this to hear captions read aloud in your selected language.',
    position: 'bottom',
  },
  {
    target: '.accessibility-mode',
    title: 'Full Screen Mode',
    content: 'Click for a distraction-free, full-screen caption view.',
    position: 'left',
  },
];

interface OnboardingTourProps {
  page: 'speaker' | 'viewer';
  onComplete: () => void;
}

export function OnboardingTour({ page, onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [show, setShow] = useState(false);

  const steps = page === 'speaker' ? SPEAKER_TOUR : VIEWER_TOUR;

  useEffect(() => {
    const key = `lingualive_tour_${page}`;
    const completed = localStorage.getItem(key);
    if (!completed) {
      setShow(true);
    }
  }, [page]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem(`lingualive_tour_${page}`, 'true');
    setShow(false);
    onComplete();
  };

  if (!show) return null;

  const step = steps[currentStep];

  return (
    <>
      <div className={styles.overlay} onClick={handleSkip} />
      <div className={styles.tooltip}>
        <div className={styles.header}>
          <span className={styles.step}>
            {currentStep + 1} / {steps.length}
          </span>
          <button className={styles.skipBtn} onClick={handleSkip}>
            Skip
          </button>
        </div>
        <h3 className={styles.title}>{step.title}</h3>
        <p className={styles.content}>{step.content}</p>
        <div className={styles.actions}>
          <button className={styles.nextBtn} onClick={handleNext}>
            {currentStep < steps.length - 1 ? 'Next' : 'Got it!'}
          </button>
        </div>
        <div className={styles.dots}>
          {steps.map((_, i) => (
            <span
              key={i}
              className={`${styles.dot} ${i === currentStep ? styles.active : ''}`}
            />
          ))}
        </div>
      </div>
    </>
  );
}

// Reset tour for testing
export function resetTour(page: 'speaker' | 'viewer') {
  localStorage.removeItem(`lingualive_tour_${page}`);
}
