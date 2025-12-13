import { useState, useEffect } from 'react';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from 'framer-motion';
import {
  ArrowRight,
  Trophy,
  BarChart3,
  Users,
  Globe,
  Mail,
  Zap,
  Shield,
  LayoutGrid,
  Swords,
  Medal,
  ChevronDown,
  ChevronUp,
  Timer,
  Megaphone,
  History,
  X,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import BracketModal from '@/components/BracketModal';
import SpotlightCard from '@/components/ui/SpotlightCard';

const HomePage = () => {
  const [activeDialog, setActiveDialog] = useState(null);
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);
  const [openFaq, setOpenFaq] = useState(null);

  const [leaderboard, setLeaderboard] = useState(null);
  const [nextMatch, setNextMatch] = useState(null);
  const [topPlayer, setTopPlayer] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [recentMatches, setRecentMatches] = useState([]);
  const [prediction, setPrediction] = useState(null);

  const [timeLeft, setTimeLeft] = useState('');
  const [isBracketOpen, setIsBracketOpen] = useState(false);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // ... (legalContent, faqs, departments definitions remain unchanged)

  // ... (containerVariants, itemVariants definitions remain unchanged)

  // ... (useEffect for liveMatches and leaderboard remain unchanged)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [nextMatchRes, topPlayerRes, announcementsRes, recentMatchesRes] =
          await Promise.all([
            fetch('http://localhost:3001/api/public/next-match'),
            fetch('http://localhost:3001/api/public/top-player'),
            fetch('http://localhost:3001/api/public/announcements'),
            fetch('http://localhost:3001/api/public/recent-matches'),
          ]);

        if (nextMatchRes.ok) {
          const data = await nextMatchRes.json();
          setNextMatch(data);
          // Fetch prediction if next match exists
          if (data && data.id) {
            const predRes = await fetch(
              `http://localhost:3001/api/public/match-prediction/${data.id}`
            );
            if (predRes.ok) {
              setPrediction(await predRes.json());
            }
          }
        }
        if (topPlayerRes.ok) {
          const data = await topPlayerRes.json();
          setTopPlayer(data);
        }
        if (announcementsRes.ok) {
          const data = await announcementsRes.json();
          setAnnouncements(data);
        }
        if (recentMatchesRes.ok) {
          const data = await recentMatchesRes.json();
          setRecentMatches(data);
        }
      } catch (error) {
        console.error('Failed to fetch additional data:', error);
      }
    };
    fetchData();
  }, []);

  const legalContent = {
    terms: (
      <div className='space-y-4 text-sm text-muted-foreground'>
        <p>
          By accessing PlayBook, you agree to be bound by these Terms of
          Service.
        </p>
        <h4 className='font-medium text-foreground'>1. Usage License</h4>
        <p>
          Permission is granted to temporarily download one copy of the
          materials (information or software) on PlayBook for personal,
          non-commercial transitory viewing only.
        </p>
        <h4 className='font-medium text-foreground'>2. User Accounts</h4>
        <p>
          You are responsible for safeguarding the password that you use to
          access the service and for any activities or actions under your
          password.
        </p>
        <h4 className='font-medium text-foreground'>3. Tournament Rules</h4>
        <p>
          All automated brackets and scoring are final unless overridden by a
          verified Super Admin. Disputes must be filed within 24 hours of match
          completion.
        </p>
      </div>
    ),
    privacy: (
      <div className='space-y-4 text-sm text-muted-foreground'>
        <p>
          Your privacy is critical to us. This policy describes how we handle
          your data.
        </p>
        <h4 className='font-medium text-foreground'>Data Collection</h4>
        <p>
          We collect basic profile information (Name, Department, ID) to verify
          eligibility for intramural sports.
        </p>
        <h4 className='font-medium text-foreground'>Analytics</h4>
        <p>
          We use aggregated, anonymized data to train our matchup prediction
          models. Your individual statistics are public as part of the
          tournament record.
        </p>
      </div>
    ),
    about: (
      <div className='space-y-4 text-sm text-muted-foreground'>
        <p>
          PlayBook is the official sports management solution for Isabela State
          University - Echague Campus.
        </p>
        <p>
          Developed by the BSCS Data Mining Track students, this system replaces
          manual paper-based bracketing with an automated, AI-enhanced web
          platform.
        </p>
        <p>
          Our mission is to provide transparency, real-time updates, and a
          professional esports-like experience for traditional campus sports.
        </p>
      </div>
    ),
  };

  const faqs = [
    {
      question: 'How do I register my team?',
      answer:
        'Navigate to the Tournaments page, select an active tournament, and click "Register Team". You will need to be logged in as a department representative.',
    },
    {
      question: 'Can I track live scores?',
      answer:
        'Yes! The homepage ticker and the Tournaments page provide real-time score updates for all active matches.',
    },
    {
      question: 'Is PlayBook mobile-friendly?',
      answer:
        'Absolutely. PlayBook is designed to work seamlessly on all devices, from desktop computers to smartphones.',
    },
    {
      question: 'Who can create tournaments?',
      answer:
        'Only designated Administrators and Super Admins have the privileges to create and manage official tournaments.',
    },
  ];

  const departments = [
    {
      name: 'College of Computing Studies',
      acronym: 'CCSICT',
      color: 'text-orange-500',
    },
    {
      name: 'College of Business Admin',
      acronym: 'CBA',
      color: 'text-yellow-500',
    },
    {
      name: 'College of Arts & Sciences',
      acronym: 'CAS',
      color: 'text-blue-500',
    },
    { name: 'College of Engineering', acronym: 'COE', color: 'text-red-600' },
    { name: 'College of Nursing', acronym: 'CON', color: 'text-green-500' },
    { name: 'College of Education', acronym: 'CEd', color: 'text-pink-500' },
    {
      name: 'College of Agriculture',
      acronym: 'CA',
      color: 'text-emerald-600',
    },
    { name: 'Criminal Justice', acronym: 'CCJE', color: 'text-violet-600' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch(
          'http://localhost:3001/api/public/leaderboard'
        );
        if (response.ok) {
          const data = await response.json();
          setLeaderboard(data);
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      }
    };

    fetchLeaderboard();
  }, []);

  useEffect(() => {
    if (!nextMatch) return;
    const timer = setInterval(() => {
      const now = new Date();
      const matchDate = new Date(nextMatch.match_date);
      const diff = matchDate - now;

      if (diff <= 0) {
        setTimeLeft('Starting Soon');
        clearInterval(timer);
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [nextMatch]);

  return (
    <div className='flex min-h-screen flex-col bg-background font-sans text-foreground selection:bg-primary/20'>
      {/* Navbar */}
      <motion.header
        className='fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-white/5 bg-background/60 p-4 px-4 backdrop-blur-xl md:px-8'
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Link to='/' className='group flex items-center gap-3'>
          <Logo className='h-8 w-auto transition-transform duration-300 group-hover:scale-105' />
          <span className='font-display text-lg font-bold tracking-tight text-foreground'>
            PlayBook
          </span>
        </Link>
        <div className='flex items-center gap-4'>
          <Link
            to='/tournaments'
            className='hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground md:block'
          >
            Tournaments
          </Link>
          <Button
            asChild
            variant='default'
            size='sm'
            className='h-9 rounded-full px-5 text-xs font-medium'
          >
            <Link to='/login'>Console</Link>
          </Button>
        </div>
      </motion.header>

      {/* Announcements Ticker */}
      <AnimatePresence>
        {announcements.length > 0 && showAnnouncement && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className='fixed left-0 right-0 top-[73px] z-40 flex items-center justify-center border-b border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary backdrop-blur-md'
          >
            <div className='flex items-center'>
              <Megaphone className='mr-2 h-4 w-4' />
              <span className='mr-2 font-bold uppercase tracking-wider'>
                {announcements[0].title}:
              </span>
              {announcements[0].content}
            </div>
            <button
              onClick={() => setShowAnnouncement(false)}
              className='absolute right-4 rounded-full p-1 transition-colors hover:bg-primary/20'
            >
              <X className='h-4 w-4' />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <main className='flex-1'>
        {/* Hero Section */}
        <section className='relative flex min-h-[90vh] flex-col justify-center overflow-hidden pt-24'>
          {/* Background Elements */}
          <div className='absolute inset-0 z-0'>
            <div className='absolute -left-[10%] -top-[10%] h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px]' />
            <div className='absolute -bottom-[10%] -right-[10%] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[120px]' />
            <div className='absolute left-[50%] top-[50%] h-[300px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[100px]' />
          </div>

          <div className='container relative z-10 mx-auto max-w-7xl px-4 md:px-8'>
            <motion.div
              className='mx-auto max-w-4xl text-center'
              variants={containerVariants}
              initial='hidden'
              animate='show'
              style={{ opacity, scale }}
            >
              <motion.div
                variants={itemVariants}
                className='mb-8 inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm'
              >
                <span className='mr-2 flex h-2 w-2'>
                  <span className='absolute inline-flex h-2 w-2 animate-ping rounded-full bg-primary opacity-75'></span>
                  <span className='relative inline-flex h-2 w-2 rounded-full bg-primary'></span>
                </span>
                ISU-Echague Intramurals 2025
              </motion.div>

              <motion.h1
                variants={itemVariants}
                className='font-display text-6xl font-bold leading-[1.1] tracking-tight text-foreground md:text-8xl'
              >
                Unleash the <br />
                <span className='bg-gradient-to-r from-primary via-green-400 to-emerald-500 bg-clip-text text-transparent'>
                  Spirit of the Games.
                </span>
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className='mx-auto mt-8 max-w-2xl text-xl leading-relaxed text-muted-foreground'
              >
                The official sports management platform for Isabela State
                University - Echague Campus. Real-time schedules, live scoring,
                and automated brackets for a seamless Intramurals experience.
              </motion.p>

              <motion.div
                variants={itemVariants}
                className='mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row'
              >
                <Button
                  asChild
                  size='lg'
                  className='h-14 rounded-full px-8 text-base shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:shadow-primary/30'
                >
                  <Link to='/tournaments'>
                    Explore Tournaments
                    <ArrowRight className='ml-2 h-5 w-5' />
                  </Link>
                </Button>
                <Button
                  asChild
                  size='lg'
                  variant='outline'
                  className='h-14 rounded-full border-white/10 bg-white/5 px-8 text-base backdrop-blur-sm transition-all hover:bg-white/10'
                >
                  <Link to='/login'>Organizer Login</Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Department Marquee */}
        <div className='relative z-10 border-b border-white/5 bg-background py-8'>
          <div className='container mx-auto max-w-7xl px-4 text-center md:px-8'>
            <p className='mb-6 text-sm font-medium uppercase tracking-widest text-muted-foreground'>
              Participating Colleges
            </p>
            <div className='flex overflow-hidden'>
              <motion.div
                className='flex gap-16 whitespace-nowrap px-4'
                animate={{ x: ['0%', '-50%'] }}
                transition={{
                  repeat: Infinity,
                  ease: 'linear',
                  duration: 30,
                }}
              >
                {[...departments, ...departments, ...departments].map(
                  (dept, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-2 text-4xl font-black tracking-tighter transition-all hover:scale-110 hover:opacity-80 ${dept.color}`}
                    >
                      {dept.acronym}
                    </div>
                  )
                )}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Features Bento Grid */}
        <section className='relative z-10 py-24'>
          <div className='container mx-auto max-w-7xl px-4 md:px-8'>
            <div className='mb-16 text-center'>
              <h2 className='text-3xl font-bold tracking-tight md:text-5xl'>
                Built for performance
              </h2>
              <p className='mt-4 text-lg text-muted-foreground'>
                Everything you need to run professional-grade tournaments.
              </p>
            </div>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-3 md:grid-rows-2 lg:gap-6'>
              {/* Large Card - Leaderboard */}
              <SpotlightCard className='col-span-1 p-8 md:col-span-2 md:row-span-2'>
                <div className='relative z-10 flex h-full flex-col justify-between'>
                  <div>
                    <div className='mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 text-primary'>
                      <Trophy className='h-6 w-6' />
                    </div>
                    <h3 className='mb-2 text-3xl font-bold'>
                      {leaderboard
                        ? leaderboard.tournament.name
                        : 'Live Leaderboard'}
                    </h3>
                    <p className='max-w-md text-muted-foreground'>
                      {leaderboard
                        ? `Top performing teams in ${leaderboard.tournament.game}`
                        : 'Current standings from active tournaments.'}
                    </p>
                  </div>

                  <div className='mt-6 space-y-3'>
                    {leaderboard && leaderboard.teams.length > 0 ? (
                      leaderboard.teams.map((team, index) => (
                        <div
                          key={index}
                          className='flex items-center justify-between rounded-lg border border-white/5 bg-black/20 p-3 backdrop-blur-sm'
                        >
                          <div className='flex items-center gap-3'>
                            <span
                              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${index === 0 ? 'bg-yellow-500/20 text-yellow-500' : index === 1 ? 'bg-gray-400/20 text-gray-400' : index === 2 ? 'bg-orange-500/20 text-orange-500' : 'bg-white/5 text-muted-foreground'}`}
                            >
                              {index + 1}
                            </span>
                            <span className='font-medium'>
                              {team.department?.acronym || 'Team'}
                            </span>
                          </div>
                          <div className='text-sm font-medium'>
                            <span className='text-primary'>{team.wins}W</span>
                            <span className='mx-1 text-muted-foreground'>
                              -
                            </span>
                            <span className='text-red-400'>{team.losses}L</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className='flex h-32 items-center justify-center text-sm text-muted-foreground'>
                        No active tournament data available.
                      </div>
                    )}
                  </div>
                </div>
              </SpotlightCard>

              {/* Small Card - Brackets */}
              <SpotlightCard
                className='col-span-1 cursor-pointer p-8 transition-all hover:scale-[1.02]'
                onClick={() => setIsBracketOpen(true)}
              >
                <div className='mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-500'>
                  <Trophy className='h-6 w-6' />
                </div>
                <h3 className='mb-2 text-xl font-bold'>Live Brackets</h3>
                <p className='text-sm text-muted-foreground'>
                  Click to view the interactive tournament tree.
                </p>
              </SpotlightCard>

              {/* Small Card - Roster */}
              <SpotlightCard className='col-span-1 p-8'>
                <div className='mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/20 text-orange-500'>
                  <Users className='h-6 w-6' />
                </div>
                <h3 className='mb-2 text-xl font-bold'>Team Mgmt</h3>
                <p className='text-sm text-muted-foreground'>
                  Streamlined roster uploads and digital verification.
                </p>
              </SpotlightCard>
            </div>

            {/* Second Row of Bento Grid */}
            <div className='mt-4 grid grid-cols-1 gap-4 md:grid-cols-4 lg:gap-6'>
              {/* Upcoming Match Card */}
              <SpotlightCard className='col-span-1 p-6 md:col-span-1'>
                <div className='mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-500'>
                  <Timer className='h-5 w-5' />
                </div>
                <h3 className='text-lg font-bold'>Next Match</h3>
                {nextMatch ? (
                  <div className='mt-2'>
                    <div className='mb-1 text-xs font-medium text-muted-foreground'>
                      {nextMatch.team1?.department?.acronym} vs{' '}
                      {nextMatch.team2?.department?.acronym}
                    </div>
                    <div className='font-mono text-xl font-bold text-primary'>
                      {timeLeft || 'Loading...'}
                    </div>
                    {/* AI Prediction Bar */}
                    {prediction && (
                      <div className='mt-4 space-y-1'>
                        <div className='flex justify-between text-[10px] font-medium uppercase text-muted-foreground'>
                          <span>Win Probability (AI)</span>
                        </div>
                        <div className='relative h-2 w-full overflow-hidden rounded-full bg-white/10'>
                          <div
                            className='absolute left-0 top-0 h-full bg-purple-500 transition-all duration-1000'
                            style={{
                              width: `${prediction.team1.winProbability}%`,
                            }}
                          />
                        </div>
                        <div className='flex justify-between text-[10px] font-bold'>
                          <span className='text-purple-400'>
                            {prediction.team1.name}{' '}
                            {prediction.team1.winProbability}%
                          </span>
                          <span className='text-muted-foreground'>
                            {prediction.team2.winProbability}%{' '}
                            {prediction.team2.name}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className='mt-2 text-xs text-muted-foreground'>
                    No upcoming matches scheduled.
                  </p>
                )}
              </SpotlightCard>

              {/* Top Player Card */}
              <SpotlightCard className='col-span-1 p-6 md:col-span-1'>
                <div className='mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/20 text-teal-500'>
                  <Medal className='h-5 w-5' />
                </div>
                <h3 className='text-lg font-bold'>MVP Spotlight</h3>
                {topPlayer ? (
                  <div className='mt-2'>
                    <div className='font-bold text-foreground'>
                      {topPlayer.name}
                    </div>
                    <div className='text-xs text-muted-foreground'>
                      {topPlayer.team?.department?.acronym} • {topPlayer.isu_ps}{' '}
                      Rating
                    </div>
                  </div>
                ) : (
                  <p className='mt-2 text-xs text-muted-foreground'>
                    No player data available yet.
                  </p>
                )}
              </SpotlightCard>

              <SpotlightCard className='col-span-1 p-6 md:col-span-2'>
                <div className='flex items-start gap-4'>
                  <div className='inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-500/20 text-pink-500'>
                    <History className='h-5 w-5' />
                  </div>
                  <div className='w-full'>
                    <h3 className='text-lg font-bold'>Recent Results</h3>
                    <div className='mt-2 space-y-2'>
                      {recentMatches.length > 0 ? (
                        recentMatches.map((match, index) => (
                          <div
                            key={index}
                            className='flex items-center justify-between text-xs'
                          >
                            <span className='text-muted-foreground'>
                              {match.team1?.department?.acronym} vs{' '}
                              {match.team2?.department?.acronym}
                            </span>
                            <span className='font-mono font-bold text-foreground'>
                              {match.team1_score} - {match.team2_score}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className='text-xs text-muted-foreground'>
                          No recent match results.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </SpotlightCard>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className='relative z-10 py-24'>
          <div className='container mx-auto max-w-7xl px-4 md:px-8'>
            <div className='mb-16 text-center'>
              <h2 className='text-3xl font-bold tracking-tight md:text-5xl'>
                How It Works
              </h2>
              <p className='mt-4 text-lg text-muted-foreground'>
                From registration to championship in three simple steps.
              </p>
            </div>

            <div className='relative grid gap-8 md:grid-cols-3'>
              {/* Connecting Line (Desktop) */}
              <div className='absolute left-0 top-12 hidden h-0.5 w-full -translate-y-1/2 bg-gradient-to-r from-transparent via-primary/30 to-transparent md:block' />

              {[
                {
                  icon: Users,
                  title: '1. Department Setup',
                  desc: 'Admins register departments and populate team rosters.',
                },
                {
                  icon: Swords,
                  title: '2. Auto-Scheduling',
                  desc: 'System generates fair brackets and match schedules instantly.',
                },
                {
                  icon: Medal,
                  title: '3. Live Competition',
                  desc: 'Scorers log results in real-time, updating standings automatically.',
                },
              ].map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className='relative z-10 flex flex-col items-center text-center'
                >
                  <div className='mb-6 flex h-24 w-24 items-center justify-center rounded-full border-4 border-background bg-card shadow-xl'>
                    <step.icon className='h-10 w-10 text-primary' />
                  </div>
                  <h3 className='mb-2 text-xl font-bold'>{step.title}</h3>
                  <p className='max-w-xs text-muted-foreground'>{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className='border-y border-white/5 bg-white/5 py-16 backdrop-blur-sm'>
          <div className='container mx-auto max-w-7xl px-4 md:px-8'>
            <div className='grid grid-cols-2 gap-8 text-center md:grid-cols-4'>
              {[
                { label: 'Departments', value: '10+' },
                { label: 'Athletes', value: '500+' },
                { label: 'Paperless', value: '100%' },
                { label: 'Live Updates', value: '24/7' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className='text-4xl font-bold text-primary md:text-5xl'>
                    {stat.value}
                  </div>
                  <div className='mt-2 text-sm font-medium uppercase tracking-wide text-muted-foreground'>
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className='relative z-10 py-24'>
          <div className='container mx-auto max-w-3xl px-4 md:px-8'>
            <div className='mb-16 text-center'>
              <h2 className='text-3xl font-bold tracking-tight md:text-5xl'>
                Frequently Asked Questions
              </h2>
            </div>
            <div className='space-y-4'>
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className='overflow-hidden rounded-xl border border-white/10 bg-card/30 backdrop-blur-sm'
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className='flex w-full items-center justify-between p-6 text-left font-medium transition-colors hover:bg-white/5'
                  >
                    <span>{faq.question}</span>
                    {openFaq === index ? (
                      <ChevronUp className='h-5 w-5 text-muted-foreground' />
                    ) : (
                      <ChevronDown className='h-5 w-5 text-muted-foreground' />
                    )}
                  </button>
                  <AnimatePresence>
                    {openFaq === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className='border-t border-white/5 px-6 pb-6 pt-2 text-muted-foreground'>
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className='relative overflow-hidden py-32'>
          <div className='absolute inset-0 bg-gradient-to-b from-transparent to-primary/10' />
          <div className='container relative z-10 mx-auto max-w-4xl px-4 text-center md:px-8'>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className='mb-6 text-4xl font-bold tracking-tight md:text-6xl'
            >
              Ready to dominate the season?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className='mb-10 text-xl text-muted-foreground'
            >
              Join thousands of students and faculty using PlayBook for a
              seamless sports experience.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Button
                asChild
                size='lg'
                className='h-14 rounded-full px-10 text-lg font-bold shadow-2xl shadow-primary/30 transition-all hover:scale-105'
              >
                <Link to='/login'>Get Started Now</Link>
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className='border-t border-white/10 bg-background pt-16'>
        <div className='container mx-auto max-w-7xl px-4 md:px-8'>
          <div className='grid gap-12 md:grid-cols-4 lg:gap-24'>
            <div className='col-span-2 lg:col-span-1'>
              <div className='flex items-center gap-2'>
                <Logo className='h-8 w-auto grayscale transition-all hover:grayscale-0' />
                <span className='text-lg font-bold'>PlayBook</span>
              </div>
              <p className='mt-4 text-sm leading-relaxed text-muted-foreground'>
                Empowering Isabela State University with next-generation sports
                management technology.
              </p>
              <div className='mt-6 flex items-center gap-4'>
                <img
                  src='/images/isu_logo.png'
                  alt='ISU Logo'
                  className='h-10 w-10 opacity-50 grayscale transition-all hover:opacity-100 hover:grayscale-0'
                />
              </div>
            </div>

            <div>
              <h4 className='mb-4 font-semibold text-foreground'>Platform</h4>
              <ul className='space-y-3 text-sm text-muted-foreground'>
                <li>
                  <Link to='/tournaments' className='hover:text-primary'>
                    All Tournaments
                  </Link>
                </li>
                <li>
                  <Link to='/login' className='hover:text-primary'>
                    Organizer Login
                  </Link>
                </li>
                <li>
                  <Link to='/tournaments' className='hover:text-primary'>
                    Live Standings
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className='mb-4 font-semibold text-foreground'>
                Legal & Support
              </h4>
              <ul className='space-y-3 text-sm text-muted-foreground'>
                <li>
                  <Dialog>
                    <DialogTrigger className='hover:text-primary hover:underline'>
                      Terms of Service
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Terms of Service</DialogTitle>
                        <DialogDescription>
                          Last updated: November 2025
                        </DialogDescription>
                      </DialogHeader>
                      <div className='max-h-[60vh] overflow-y-auto'>
                        {legalContent.terms}
                      </div>
                    </DialogContent>
                  </Dialog>
                </li>
                <li>
                  <Dialog>
                    <DialogTrigger className='hover:text-primary hover:underline'>
                      Privacy Policy
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Privacy Policy</DialogTitle>
                        <DialogDescription>
                          How we manage your data
                        </DialogDescription>
                      </DialogHeader>
                      <div className='max-h-[60vh] overflow-y-auto'>
                        {legalContent.privacy}
                      </div>
                    </DialogContent>
                  </Dialog>
                </li>
                <li>
                  <Dialog>
                    <DialogTrigger className='hover:text-primary hover:underline'>
                      About Us
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>About PlayBook</DialogTitle>
                        <DialogDescription>
                          The team behind the platform
                        </DialogDescription>
                      </DialogHeader>
                      <div className='max-h-[60vh] overflow-y-auto'>
                        {legalContent.about}
                      </div>
                    </DialogContent>
                  </Dialog>
                </li>
              </ul>
            </div>

            <div>
              <h4 className='mb-4 font-semibold text-foreground'>Contact</h4>
              <ul className='space-y-3 text-sm text-muted-foreground'>
                <li>
                  <a
                    href='mailto:support@isu.edu.ph'
                    className='flex items-center gap-2 hover:text-primary'
                  >
                    <Mail className='h-4 w-4' />
                    <span>support@isu.edu.ph</span>
                  </a>
                </li>
                <li>
                  <a
                    href='https://isu.edu.ph'
                    target='_blank'
                    rel='noreferrer'
                    className='flex items-center gap-2 hover:text-primary'
                  >
                    <Globe className='h-4 w-4' />
                    <span>www.isu.edu.ph</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className='mt-16 border-t border-white/10 py-8 text-center text-sm text-muted-foreground'>
            <p>
              &copy; {new Date().getFullYear()} PlayBook Tournament System. All
              rights reserved.
            </p>
            <p className='mt-2 text-xs'>
              Developed by ISU BSCS Data Mining Track.
            </p>
          </div>
        </div>
      </footer>

      <BracketModal
        isOpen={isBracketOpen}
        onClose={() => setIsBracketOpen(false)}
        tournamentId={leaderboard?.tournament?.id}
      />
    </div>
  );
};

export default HomePage;
