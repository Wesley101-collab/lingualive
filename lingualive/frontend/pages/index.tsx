import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Landing.module.css';

const features = [
  {
    icon: '🎤',
    title: 'Live Transcription',
    desc: 'Real-time speech-to-text powered by Speechmatics AI with 95%+ accuracy',
    color: '#6366f1',
  },
  {
    icon: '🌍',
    title: 'Instant Translation',
    desc: 'Translate to Spanish, French, German, Chinese in real-time',
    color: '#8b5cf6',
  },
  {
    icon: '🎧',
    title: 'Listen Mode',
    desc: 'Text-to-speech reads captions aloud in your selected language',
    color: '#ec4899',
  },
  {
    icon: '📹',
    title: 'Video Upload',
    desc: 'Upload recordings for AI transcription using Whisper',
    color: '#14b8a6',
  },
  {
    icon: '✨',
    title: 'AI Summaries',
    desc: 'Auto-generate summaries, key points, and action items',
    color: '#f59e0b',
  },
  {
    icon: '📱',
    title: 'Mobile Ready',
    desc: 'Works on any device - share link and view on phones',
    color: '#10b981',
  },
];

const stats = [
  { value: '5+', label: 'Languages' },
  { value: '95%', label: 'Accuracy' },
  { value: '<1s', label: 'Latency' },
  { value: '∞', label: 'Free Usage' },
];

const testimonials = [
  { text: 'Perfect for my international team meetings!', author: 'Remote Team Lead' },
  { text: 'My deaf students can finally follow lectures in real-time.', author: 'University Professor' },
  { text: 'Game changer for creating subtitles.', author: 'Content Creator' },
];

export default function LandingPage() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [typedText, setTypedText] = useState('');
  const fullText = 'Hello, welcome to LinguaLive';

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i <= fullText.length) {
        setTypedText(fullText.slice(0, i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 80);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <Head>
        <title>LinguaLive - Real-Time Multilingual Captions</title>
        <meta name="description" content="Real-time speech transcription and translation for meetings, classrooms, and events" />
      </Head>

      <div className={styles.landing}>
        {/* Animated Background */}
        <div className={styles.bgGradient} />
        <div className={styles.bgOrbs}>
          <div className={styles.orb1} />
          <div className={styles.orb2} />
          <div className={styles.orb3} />
        </div>

        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.badge}>
              <span className={styles.badgeDot} />
              Powered by AI
            </div>
            <h1 className={styles.heroTitle}>
              Break Language<br />
              <span className={styles.gradient}>Barriers Instantly</span>
            </h1>
            <p className={styles.heroDesc}>
              Real-time speech transcription and translation for meetings, 
              classrooms, and events. Speak in one language, everyone understands.
            </p>
            <div className={styles.heroCta}>
              <Link href="/speaker" className={styles.primaryBtn}>
                <span className={styles.btnIcon}>🎤</span>
                Start Speaking
                <span className={styles.btnArrow}>→</span>
              </Link>
              <Link href="/viewer" className={styles.secondaryBtn}>
                <span className={styles.btnIcon}>👁️</span>
                Join as Viewer
              </Link>
            </div>
            
            {/* Stats */}
            <div className={styles.stats}>
              {stats.map((stat, i) => (
                <div key={i} className={styles.stat}>
                  <span className={styles.statValue}>{stat.value}</span>
                  <span className={styles.statLabel}>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className={styles.heroVisual}>
            <div className={styles.mockup}>
              <div className={styles.mockupHeader}>
                <div className={styles.dots}>
                  <span /><span /><span />
                </div>
                <span className={styles.mockupTitle}>LinguaLive</span>
              </div>
              <div className={styles.mockupContent}>
                <div className={styles.captionLine}>
                  <span className={styles.langTag} style={{ background: '#6366f1' }}>EN</span>
                  <span className={styles.captionText}>{typedText}<span className={styles.cursor} /></span>
                </div>
                <div className={`${styles.captionLine} ${styles.translated}`}>
                  <span className={styles.langTag} style={{ background: '#ec4899' }}>ES</span>
                  <span className={styles.captionText}>Hola, bienvenido a LinguaLive</span>
                </div>
                <div className={`${styles.captionLine} ${styles.translated}`}>
                  <span className={styles.langTag} style={{ background: '#8b5cf6' }}>FR</span>
                  <span className={styles.captionText}>Bonjour, bienvenue sur LinguaLive</span>
                </div>
                <div className={`${styles.captionLine} ${styles.translated}`}>
                  <span className={styles.langTag} style={{ background: '#14b8a6' }}>DE</span>
                  <span className={styles.captionText}>Hallo, willkommen bei LinguaLive</span>
                </div>
              </div>
              <div className={styles.mockupFooter}>
                <span className={styles.liveIndicator}>
                  <span className={styles.liveDot} />
                  Live
                </span>
                <span>4 languages</span>
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className={styles.floatingCard} style={{ top: '10%', right: '-20px' }}>
              🎧 Listen Mode
            </div>
            <div className={styles.floatingCard} style={{ bottom: '20%', left: '-30px' }}>
              ✨ AI Summary
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className={styles.features}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>Features</span>
            <h2>Everything you need for<br /><span className={styles.gradient}>accessible communication</span></h2>
          </div>
          <div className={styles.featureGrid}>
            {features.map((feature, i) => (
              <div key={i} className={styles.featureCard} style={{ '--accent': feature.color } as React.CSSProperties}>
                <div className={styles.featureIconWrap}>
                  <span className={styles.featureIcon}>{feature.icon}</span>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className={styles.howItWorks}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>How It Works</span>
            <h2>Get started in <span className={styles.gradient}>3 simple steps</span></h2>
          </div>
          <div className={styles.steps}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h3>Start Speaking</h3>
                <p>Click the microphone button and speak naturally. Our AI transcribes in real-time.</p>
              </div>
            </div>
            <div className={styles.stepLine} />
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h3>Share the Link</h3>
                <p>Copy the viewer link and share with your audience via QR code or message.</p>
              </div>
            </div>
            <div className={styles.stepLine} />
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h3>View in Any Language</h3>
                <p>Viewers select their language and see live translated captions instantly.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className={styles.testimonials}>
          <div className={styles.testimonialCard}>
            <span className={styles.quoteIcon}>"</span>
            <p className={styles.testimonialText}>{testimonials[activeTestimonial].text}</p>
            <span className={styles.testimonialAuthor}>— {testimonials[activeTestimonial].author}</span>
            <div className={styles.testimonialDots}>
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  className={`${styles.testimonialDot} ${i === activeTestimonial ? styles.active : ''}`}
                  onClick={() => setActiveTestimonial(i)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.cta}>
          <div className={styles.ctaContent}>
            <h2>Ready to break language barriers?</h2>
            <p>Start using LinguaLive for free — no sign-up required</p>
            <div className={styles.ctaButtons}>
              <Link href="/speaker" className={styles.primaryBtn}>
                Get Started Free
                <span className={styles.btnArrow}>→</span>
              </Link>
              <Link href="/upload" className={styles.outlineBtn}>
                Upload a Video
              </Link>
            </div>
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
              <div className={styles.footerCol}>
                <h4>Product</h4>
                <Link href="/speaker">Speaker Mode</Link>
                <Link href="/viewer">Viewer Mode</Link>
                <Link href="/upload">Upload Video</Link>
              </div>
              <div className={styles.footerCol}>
                <h4>Resources</h4>
                <Link href="/history">Session History</Link>
                <a href="https://github.com/Wesley101-collab/lingualive" target="_blank" rel="noopener">GitHub</a>
              </div>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p>© 2024 LinguaLive. Built for accessible communication.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
