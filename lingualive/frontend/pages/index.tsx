import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Landing.module.css';

const features = [
  {
    icon: '🎤',
    title: 'Live Transcription',
    desc: 'Real-time speech-to-text powered by Speechmatics AI',
  },
  {
    icon: '🌐',
    title: 'Multi-Language',
    desc: 'Instant translation to Spanish, French, German, Chinese',
  },
  {
    icon: '📁',
    title: 'Video Upload',
    desc: 'Upload recordings for transcription and analysis',
  },
  {
    icon: '✨',
    title: 'AI Summaries',
    desc: 'Auto-generate summaries and extract action items',
  },
  {
    icon: '👥',
    title: 'Live Sharing',
    desc: 'Share viewer link for real-time caption viewing',
  },
  {
    icon: '♿',
    title: 'Accessibility',
    desc: 'High contrast mode and full-screen captions',
  },
];

const useCases = [
  { icon: '🎓', title: 'Classrooms', desc: 'Multilingual lectures for international students' },
  { icon: '🏢', title: 'Meetings', desc: 'Real-time captions for remote and hybrid teams' },
  { icon: '🎬', title: 'Creators', desc: 'Generate subtitles for videos and podcasts' },
  { icon: '🌍', title: 'Events', desc: 'Live captions for conferences and presentations' },
];

export default function LandingPage() {
  return (
    <>
      <Head>
        <title>LinguaLive - Real-Time Multilingual Captions</title>
        <meta name="description" content="Real-time speech transcription and translation for meetings, classrooms, and events" />
      </Head>

      <div className={styles.landing}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.badge}>🚀 Now with AI Summaries</div>
            <h1 className={styles.heroTitle}>
              Real-Time Captions,<br />
              <span className={styles.gradient}>Any Language</span>
            </h1>
            <p className={styles.heroDesc}>
              Transform your meetings, classes, and events with instant speech-to-text 
              transcription and live translation to multiple languages.
            </p>
            <div className={styles.heroCta}>
              <Link href="/speaker" className={styles.primaryBtn}>
                🎤 Start Speaking
              </Link>
              <Link href="/viewer" className={styles.secondaryBtn}>
                👁️ Join as Viewer
              </Link>
            </div>
            <p className={styles.heroNote}>No sign-up required • Free to use</p>
          </div>
          
          <div className={styles.heroVisual}>
            <div className={styles.mockup}>
              <div className={styles.mockupHeader}>
                <span className={styles.dot}></span>
                <span className={styles.dot}></span>
                <span className={styles.dot}></span>
              </div>
              <div className={styles.mockupContent}>
                <div className={styles.captionLine}>
                  <span className={styles.langTag}>EN</span>
                  Hello, welcome to today's presentation
                </div>
                <div className={styles.captionLine}>
                  <span className={styles.langTag}>ES</span>
                  Hola, bienvenidos a la presentación de hoy
                </div>
                <div className={styles.captionLine}>
                  <span className={styles.langTag}>FR</span>
                  Bonjour, bienvenue à la présentation d'aujourd'hui
                </div>
                <div className={styles.captionLine + ' ' + styles.typing}>
                  <span className={styles.langTag}>DE</span>
                  Hallo, willkommen zur heutigen Präsentation
                  <span className={styles.cursor}></span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className={styles.features}>
          <div className={styles.sectionHeader}>
            <h2>Everything you need for accessible communication</h2>
            <p>Powerful features to break language barriers</p>
          </div>
          <div className={styles.featureGrid}>
            {features.map((feature, i) => (
              <div key={i} className={styles.featureCard}>
                <span className={styles.featureIcon}>{feature.icon}</span>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className={styles.howItWorks}>
          <div className={styles.sectionHeader}>
            <h2>How it works</h2>
            <p>Get started in seconds</p>
          </div>
          <div className={styles.steps}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <h3>Start Speaking</h3>
              <p>Click the microphone and speak naturally</p>
            </div>
            <div className={styles.stepArrow}>→</div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <h3>Share Link</h3>
              <p>Send the viewer link to your audience</p>
            </div>
            <div className={styles.stepArrow}>→</div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <h3>View Captions</h3>
              <p>Viewers see live captions in their language</p>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className={styles.useCases}>
          <div className={styles.sectionHeader}>
            <h2>Built for everyone</h2>
            <p>From classrooms to boardrooms</p>
          </div>
          <div className={styles.useCaseGrid}>
            {useCases.map((useCase, i) => (
              <div key={i} className={styles.useCaseCard}>
                <span className={styles.useCaseIcon}>{useCase.icon}</span>
                <h3>{useCase.title}</h3>
                <p>{useCase.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.cta}>
          <h2>Ready to break language barriers?</h2>
          <p>Start using LinguaLive for free today</p>
          <div className={styles.ctaButtons}>
            <Link href="/speaker" className={styles.primaryBtn}>
              Get Started Free
            </Link>
            <Link href="/upload" className={styles.secondaryBtn}>
              Upload a Video
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className={styles.footer}>
          <div className={styles.footerContent}>
            <div className={styles.footerBrand}>
              <span className={styles.footerLogo}>🌐 LinguaLive</span>
              <p>Real-time multilingual captions for everyone</p>
            </div>
            <div className={styles.footerLinks}>
              <Link href="/speaker">Speaker</Link>
              <Link href="/viewer">Viewer</Link>
              <Link href="/upload">Upload</Link>
              <Link href="/history">History</Link>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p>© 2024 LinguaLive. Made for accessible communication.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
