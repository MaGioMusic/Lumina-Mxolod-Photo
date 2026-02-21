'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
  FC,
} from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface ProgressSliderContextType {
  active: string;
  progress: number;
  handleButtonClick: (value: string) => void;
  vertical: boolean;
}

interface ProgressSliderProps {
  children: ReactNode;
  duration?: number;
  fastDuration?: number;
  vertical?: boolean;
  activeSlider: string;
  className?: string;
}

interface SliderContentProps {
  children: ReactNode;
  className?: string;
}

interface SliderWrapperProps {
  children: ReactNode;
  value: string;
  className?: string;
}

interface ProgressBarProps {
  children: ReactNode;
  className?: string;
}

interface SliderBtnProps {
  children: ReactNode;
  value: string;
  className?: string;
  progressBarClass?: string;
}

const ProgressSliderContext = createContext<
  ProgressSliderContextType | undefined
>(undefined);

const useProgressSliderContext = (): ProgressSliderContextType => {
  const context = useContext(ProgressSliderContext);
  if (!context) {
    throw new Error(
      'useProgressSliderContext must be used within a ProgressSlider'
    );
  }
  return context;
};

export const ProgressSlider: FC<ProgressSliderProps> = ({
  children,
  duration = 5000,
  fastDuration = 400,
  vertical = false,
  activeSlider,
  className,
}) => {
  const [active, setActive] = useState<string>(activeSlider);
  const [progress, setProgress] = useState<number>(0);
  const [isFastForward, setIsFastForward] = useState<boolean>(false);
  const frame = useRef<number>(0);
  const firstFrameTime = useRef<number>(performance.now());
  const targetValue = useRef<string | null>(null);
  const [sliderValues, setSliderValues] = useState<string[]>([]);

  useEffect(() => {
    const sliderContent = React.Children.toArray(children).find(
      (child) => (child as React.ReactElement<any>).type === SliderContent
    ) as React.ReactElement<any> | undefined;

    if (sliderContent) {
      const values = React.Children.toArray(sliderContent.props.children).map(
        (child) => (child as React.ReactElement<any>).props.value as string
      );
      setSliderValues(values);
    }
  }, [children]);

  const animate = useCallback((now: number) => {
    const currentDuration = isFastForward ? fastDuration : duration;
    const elapsedTime = now - firstFrameTime.current;
    const timeFraction = elapsedTime / currentDuration;

    if (timeFraction <= 1) {
      setProgress((prev) =>
        isFastForward ? prev + (100 - prev) * timeFraction : timeFraction * 100
      );
      frame.current = requestAnimationFrame(animate);
    } else {
      if (isFastForward) {
        setIsFastForward(false);
        if (targetValue.current !== null) {
          setActive(targetValue.current);
          targetValue.current = null;
        }
      } else {
        const currentIndex = sliderValues.indexOf(active);
        const nextIndex = (currentIndex + 1) % sliderValues.length;
        setActive(sliderValues[nextIndex]);
      }
      setProgress(0);
      firstFrameTime.current = performance.now();
    }
  }, [active, duration, fastDuration, isFastForward, sliderValues]);

  useEffect(() => {
    if (sliderValues.length > 0) {
      firstFrameTime.current = performance.now();
      frame.current = requestAnimationFrame(animate);
    }
    return () => {
      cancelAnimationFrame(frame.current);
    };
  }, [sliderValues, active, isFastForward, animate]);

  const handleButtonClick = (value: string) => {
    if (value !== active) {
      const elapsedTime = performance.now() - firstFrameTime.current;
      const currentProgress = (elapsedTime / duration) * 100;
      setProgress(currentProgress);
      targetValue.current = value;
      setIsFastForward(true);
      firstFrameTime.current = performance.now();
    }
  };

  return (
    <ProgressSliderContext.Provider
      value={{ active, progress, handleButtonClick, vertical }}
    >
      <div className={cn('relative', className)}>{children}</div>
    </ProgressSliderContext.Provider>
  );
};

export const SliderContent: FC<SliderContentProps> = ({
  children,
  className,
}) => {
  return <div className={cn('', className)}>{children}</div>;
};

export const SliderWrapper: FC<SliderWrapperProps> = ({
  children,
  value,
  className,
}) => {
  const { active } = useProgressSliderContext();

  return (
    <AnimatePresence mode='popLayout'>
      {active === value && (
        <motion.div
          key={value}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn('', className)}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const SliderBtnGroup: FC<ProgressBarProps> = ({
  children,
  className,
}) => {
  return <div className={cn('', className)}>{children}</div>;
};

export const SliderBtn: FC<SliderBtnProps> = ({
  children,
  value,
  className,
  progressBarClass,
}) => {
  const { active, progress, handleButtonClick, vertical } =
    useProgressSliderContext();

  return (
    <button
      className={cn(
        `relative ${active === value ? 'opacity-100' : 'opacity-60'} transition-opacity`,
        className
      )}
      onClick={() => handleButtonClick(value)}
    >
      {children}
      <div
        className='absolute inset-0 overflow-hidden -z-10'
        role='progressbar'
        aria-valuenow={active === value ? progress : 0}
      >
        <span
          className={cn('absolute left-0 top-0', progressBarClass)}
          style={{
            [vertical ? 'height' : 'width']:
              active === value ? `${progress}%` : '0%',
          }}
        />
      </div>
    </button>
  );
};

