import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Quote, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface iTestimonial {
  name: string;
  designation: string;
  description: string;
  profileImage: string;
}

interface iCarouselProps {
  items: React.ReactElement<{
    testimonial: iTestimonial;
    index: number;
    layout?: boolean;
    onCardClose: () => void;
  }>[];
  initialScroll?: number;
}

const useOutsideClick = (
  ref: React.RefObject<HTMLDivElement | null>,
  onOutsideClick: () => void
) => {
  useEffect(() => {
    const handle = (e: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      onOutsideClick();
    };
    document.addEventListener('mousedown', handle);
    document.addEventListener('touchstart', handle);
    return () => {
      document.removeEventListener('mousedown', handle);
      document.removeEventListener('touchstart', handle);
    };
  }, [ref, onOutsideClick]);
};

export const Carousel = ({ items, initialScroll = 0 }: iCarouselProps) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollability = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
    }
  };

  const handleScrollLeft = () => carouselRef.current?.scrollBy({ left: -300, behavior: 'smooth' });
  const handleScrollRight = () => carouselRef.current?.scrollBy({ left: 300, behavior: 'smooth' });

  const handleCardClose = (index: number) => {
    if (carouselRef.current) {
      const isMobile = window.innerWidth < 768;
      const cardWidth = isMobile ? 230 : 384;
      const gap = isMobile ? 4 : 8;
      carouselRef.current.scrollTo({ left: (cardWidth + gap) * (index + 1), behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = initialScroll;
      checkScrollability();
    }
  }, [initialScroll]);

  return (
    <div className="relative w-full mt-10">
      <div
        className="flex w-full overflow-x-scroll overscroll-x-auto scroll-smooth py-5"
        style={{ scrollbarWidth: 'none' }}
        ref={carouselRef}
        onScroll={checkScrollability}
      >
        <div className={cn('flex flex-row justify-start gap-4 pl-3', 'max-w-5xl mx-auto')}>
          {items.map((item, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2 * index, ease: 'easeOut' } }}
              key={`card-${index}`}
              className="last:pr-[5%] md:last:pr-[33%] rounded-3xl"
            >
              {React.cloneElement(item, { onCardClose: () => handleCardClose(index) })}
            </motion.div>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button
          className="relative z-40 h-10 w-10 rounded-full flex items-center justify-center disabled:opacity-50 transition-colors duration-200"
          style={{ background: '#4b3f33' }}
          onClick={handleScrollLeft}
          disabled={!canScrollLeft}
        >
          <ArrowLeft className="h-6 w-6" style={{ color: '#f2f0eb' }} />
        </button>
        <button
          className="relative z-40 h-10 w-10 rounded-full flex items-center justify-center disabled:opacity-50 transition-colors duration-200"
          style={{ background: '#4b3f33' }}
          onClick={handleScrollRight}
          disabled={!canScrollRight}
        >
          <ArrowRight className="h-6 w-6" style={{ color: '#f2f0eb' }} />
        </button>
      </div>
    </div>
  );
};

export const TestimonialCard = ({
  testimonial,
  index,
  layout = false,
  onCardClose = () => {},
  backgroundImage = 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop',
}: {
  testimonial: iTestimonial;
  index: number;
  layout?: boolean;
  onCardClose?: () => void;
  backgroundImage?: string;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCollapse = () => {
    setIsExpanded(false);
    onCardClose();
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleCollapse(); };
    if (isExpanded) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      document.body.dataset.scrollY = scrollY.toString();
    } else {
      const scrollY = parseInt(document.body.dataset.scrollY || '0', 10);
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      window.scrollTo({ top: scrollY, behavior: 'instant' });
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isExpanded]);

  useOutsideClick(containerRef, handleCollapse);

  return (
    <>
      <AnimatePresence>
        {isExpanded && (
          <div className="fixed inset-0 h-screen overflow-hidden z-50">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="backdrop-blur-lg h-full w-full fixed inset-0" style={{ background: 'rgba(0,0,0,0.3)' }} />
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              ref={containerRef}
              layoutId={layout ? `card-${testimonial.name}` : undefined}
              className="max-w-5xl mx-auto h-full z-[60] p-4 md:p-10 rounded-3xl relative md:mt-10 overflow-y-auto"
              style={{ background: 'linear-gradient(to bottom, #f2f0eb, #fff9eb)' }}
            >
              <button className="sticky top-4 h-8 w-8 right-0 ml-auto rounded-full flex items-center justify-center"
                style={{ background: '#4b3f33' }} onClick={handleCollapse}>
                <X className="h-6 w-6 absolute" style={{ color: 'white' }} />
              </button>
              <p className="px-0 md:px-20 text-lg font-thin underline underline-offset-8 mt-4"
                style={{ fontFamily: 'var(--font-display)', color: 'rgba(31,27,29,0.7)' }}>
                {testimonial.designation}
              </p>
              <p className="px-0 md:px-20 text-2xl md:text-4xl font-normal italic mt-4"
                style={{ fontFamily: 'var(--font-display)', color: 'rgba(31,27,29,0.7)' }}>
                {testimonial.name}
              </p>
              <div className="py-8 px-0 md:px-20 text-xl md:text-2xl font-thin leading-snug tracking-wide"
                style={{ fontFamily: 'var(--font-display)', color: 'rgba(31,27,29,0.7)' }}>
                <Quote className="h-6 w-6 mb-4" style={{ color: 'rgba(31,27,29,0.5)' }} />
                {testimonial.description}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.button
        layoutId={layout ? `card-${testimonial.name}` : undefined}
        onClick={() => setIsExpanded(true)}
        whileHover={{ rotate: 3, scale: 1.02, transition: { duration: 0.3, ease: 'easeOut' } }}
      >
        <div className="rounded-3xl h-[500px] md:h-[550px] w-80 md:w-96 overflow-hidden flex flex-col items-center justify-center relative z-10 shadow-md"
          style={{ background: 'linear-gradient(to bottom, #f2f0eb, #fff9eb)' }}>
          <div className="absolute" style={{ inset: '-1px 0 0', opacity: 0.3 }}>
            <img src={backgroundImage} alt="" className="block object-cover object-center"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
          </div>

          <ProfileImage src={testimonial.profileImage} alt={testimonial.name} />

          <p className="text-xl text-center px-3 mt-4 leading-tight font-normal"
            style={{ fontFamily: 'var(--font-display)', color: 'rgba(31,27,29,0.7)' }}>
            {testimonial.description.length > 100
              ? `${testimonial.description.slice(0, 100)}...`
              : testimonial.description}
          </p>
          <p className="text-xl font-thin italic text-center mt-5"
            style={{ fontFamily: 'var(--font-display)', color: 'rgba(31,27,29,0.7)' }}>
            {testimonial.name}.
          </p>
          <p className="text-sm font-thin italic text-center mt-1 underline underline-offset-4 decoration-1"
            style={{ fontFamily: 'var(--font-display)', color: 'rgba(31,27,29,0.7)' }}>
            {testimonial.designation.length > 30
              ? `${testimonial.designation.slice(0, 30)}...`
              : testimonial.designation}
          </p>
        </div>
      </motion.button>
    </>
  );
};

export const ProfileImage = ({ src, alt }: { src: string; alt: string }) => {
  const [isLoading, setLoading] = useState(true);
  return (
    <div className="w-[90px] h-[90px] md:w-[150px] md:h-[150px] overflow-hidden rounded-full relative flex-none"
      style={{ border: '3px solid rgba(59,59,59,0.6)', opacity: 0.8, filter: 'saturate(0.2) sepia(0.46)' }}>
      <img
        className={cn('absolute inset-0 rounded-full object-cover z-50 w-full h-full transition duration-300', isLoading ? 'blur-sm' : 'blur-0')}
        onLoad={() => setLoading(false)}
        src={src}
        width={150}
        height={150}
        loading="lazy"
        decoding="async"
        alt={alt || 'Foto de perfil'}
      />
    </div>
  );
};
