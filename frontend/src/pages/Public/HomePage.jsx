import { useState } from 'react';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Trophy,
  BarChart3,
  Users,
  Globe,
  Mail,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import ImageCarousel from '@/components/ImageCarousel';
import { containerVariants, itemVariants } from '@/lib/animations';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const HomePage = () => {
  const [activeDialog, setActiveDialog] = useState(null);

  const carouselImages = [
    '/images/picbasketball.jpg',
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2070',
    '/images/picvolleyball.jpg',
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=2071',
    '/images/picarchery.jpg',
    '/images/picbaseball.jpg',
  ];

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
          PlayBook V4 is the official sports management solution for Isabela
          State University.
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

  return (
    <div className='flex min-h-screen flex-col bg-background font-sans text-foreground selection:bg-primary/20'>
      <motion.header
        className='fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-border/40 bg-background/80 p-4 px-4 backdrop-blur-md md:px-8'
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Link to='/' className='group flex items-center gap-3'>
          <Logo className='h-9 w-auto transition-transform duration-300 group-hover:scale-105' />
          <span className='font-display text-xl font-bold tracking-tight text-foreground'>
            PlayBook
          </span>
        </Link>
        <div className='flex items-center gap-4'>
          <Link
            to='/tournaments'
            className='hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground md:block'
          >
            View Tournaments
          </Link>
          <Button
            asChild
            variant='default'
            size='sm'
            className='rounded-full px-6'
          >
            <Link to='/login'>Admin Console</Link>
          </Button>
        </div>
      </motion.header>

      <main className='flex-1 pt-24'>
        <section className='container mx-auto max-w-7xl px-4 md:px-8'>
          <div className='grid gap-12 lg:grid-cols-2 lg:items-center'>
            <motion.div
              className='flex flex-col justify-center text-center lg:text-left'
              variants={containerVariants}
              initial='hidden'
              animate='show'
            >
              <motion.div
                variants={itemVariants}
                className='mb-6 inline-flex items-center justify-center self-center rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary lg:self-start'
              >
                <span className='mr-2 flex h-2 w-2'>
                  <span className='absolute inline-flex h-2 w-2 animate-ping rounded-full bg-primary opacity-75'></span>
                  <span className='relative inline-flex h-2 w-2 rounded-full bg-primary'></span>
                </span>
                The Official ISU Tournament System
              </motion.div>

              <motion.h1
                variants={itemVariants}
                className='font-display text-5xl font-bold leading-[1.1] tracking-tight text-foreground md:text-7xl'
              >
                Manage sports, <br />
                <span className='bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent'>
                  effortlessly.
                </span>
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className='mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground lg:mx-0'
              >
                A unified platform for Isabela State University's intramurals.
                Real-time scoring, automated brackets, and advanced player
                analytics powered by modern web technology.
              </motion.p>

              <motion.div
                variants={itemVariants}
                className='mt-10 flex flex-col items-center gap-4 sm:flex-row lg:justify-start'
              >
                <Button
                  asChild
                  size='lg'
                  className='h-12 w-full rounded-full px-8 text-base shadow-lg shadow-primary/20 sm:w-auto'
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
                  className='h-12 w-full rounded-full border-2 bg-transparent px-8 text-base hover:bg-accent sm:w-auto'
                >
                  <Link to='/login'>Organizer Login</Link>
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className='relative hidden lg:block'
            >
              <div className='absolute -inset-1 rounded-[2.5rem] bg-gradient-to-r from-primary/30 to-blue-500/30 opacity-50 blur-2xl' />
              <ImageCarousel
                images={carouselImages}
                className='relative h-[600px] w-full rounded-[2rem] border border-white/10 shadow-2xl'
              />
            </motion.div>
          </div>
        </section>

        <section className='container mx-auto mt-24 max-w-7xl px-4 pb-24 md:px-8'>
          <div className='mb-12 text-center'>
            <h2 className='text-3xl font-bold tracking-tight md:text-4xl'>
              Everything you need to win
            </h2>
            <p className='mt-4 text-lg text-muted-foreground'>
              Powerful tools for organizers, transparency for players.
            </p>
          </div>

          <div className='grid gap-6 md:grid-cols-3'>
            <motion.div
              whileHover={{ y: -5 }}
              className='group rounded-3xl border border-border bg-card p-8 shadow-sm transition-all hover:shadow-md'
            >
              <div className='mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600'>
                <Trophy className='h-6 w-6' />
              </div>
              <h3 className='mb-2 text-xl font-bold'>Automated Brackets</h3>
              <p className='text-muted-foreground'>
                Single elimination, round robin, or custom formats. Generated
                instantly based on team inputs.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className='group rounded-3xl border border-border bg-card p-8 shadow-sm transition-all hover:shadow-md'
            >
              <div className='mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600'>
                <BarChart3 className='h-6 w-6' />
              </div>
              <h3 className='mb-2 text-xl font-bold'>Live Analytics</h3>
              <p className='text-muted-foreground'>
                Track player efficiency, team Elo ratings, and predictive
                outcomes powered by data science.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className='group rounded-3xl border border-border bg-card p-8 shadow-sm transition-all hover:shadow-md'
            >
              <div className='mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-600'>
                <Users className='h-6 w-6' />
              </div>
              <h3 className='mb-2 text-xl font-bold'>Roster Management</h3>
              <p className='text-muted-foreground'>
                Streamlined bulk uploads and digital verification for student
                athletes across all departments.
              </p>
            </motion.div>
          </div>
        </section>

        <section className='border-y border-border bg-surface-variant/30 py-16'>
          <div className='container mx-auto max-w-7xl px-4 md:px-8'>
            <div className='grid grid-cols-2 gap-8 text-center md:grid-cols-4'>
              <div>
                <div className='text-4xl font-bold text-primary'>10+</div>
                <div className='mt-2 text-sm font-medium uppercase tracking-wide text-muted-foreground'>
                  Departments
                </div>
              </div>
              <div>
                <div className='text-4xl font-bold text-primary'>500+</div>
                <div className='mt-2 text-sm font-medium uppercase tracking-wide text-muted-foreground'>
                  Athletes
                </div>
              </div>
              <div>
                <div className='text-4xl font-bold text-primary'>100%</div>
                <div className='mt-2 text-sm font-medium uppercase tracking-wide text-muted-foreground'>
                  Paperless
                </div>
              </div>
              <div>
                <div className='text-4xl font-bold text-primary'>24/7</div>
                <div className='mt-2 text-sm font-medium uppercase tracking-wide text-muted-foreground'>
                  Live Updates
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className='border-t border-border bg-surface pt-16'>
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
                  className='h-10 w-10 opacity-80 grayscale transition-all hover:grayscale-0'
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

          <div className='mt-16 border-t border-border py-8 text-center text-sm text-muted-foreground'>
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
    </div>
  );
};

export default HomePage;
