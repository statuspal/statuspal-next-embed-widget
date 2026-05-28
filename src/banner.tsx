import { Fragment } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { NoticeWithState, Service } from 'types/general';
import { STATUSPAL_NEXT_CLOSE_BANNER_EVENT, dismissNotice } from './main';
import ExclamationTriangleIcon from '@heroicons/react/24/solid/ExclamationTriangleIcon';
import WrenchIcon from '@heroicons/react/24/solid/WrenchIcon';
import XMarkIcon from '@heroicons/react/24/solid/XMarkIcon';
import InformationCircleIcon from '@heroicons/react/24/solid/InformationCircleIcon';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { statusColors } from './helpers';

dayjs.extend(duration);

// Main banner component - displays status information with controls
const Banner = ({
  notices,
  services,
  config: {
    origin,
    banner: { position, theme }
  },
  options = {}
}: {
  notices: NoticeWithState[];
  services: Service[];
  config: ReturnType<typeof window.StatusPalNextWidget.getConfig>;
  options?: { noEnterAnimation?: boolean };
}) => {
  const [visibleNotices, setVisibleNotices] = useState([...notices]);
  const [currentNotice, setCurrentNotice] = useState(visibleNotices[0]);
  const [isClosing, setIsClosing] = useState(false);

  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bannerElement = bannerRef.current;

    const handleAnimationEnd = () => {
      if (!isClosing) return;

      if (visibleNotices.length < 2) {
        window.StatusPalNextWidget.destroy({
          onlyBanner: true,
          animationEnded: true
        });
        return;
      }

      setVisibleNotices(prev => prev.slice(1));
      setIsClosing(false);
    };

    bannerElement.addEventListener('animationend', handleAnimationEnd);

    return () =>
      bannerElement.removeEventListener('animationend', handleAnimationEnd);
  }, [isClosing, visibleNotices.length]);

  useEffect(
    () => setCurrentNotice(visibleNotices[0]),
    [visibleNotices, visibleNotices.length]
  );

  useEffect(() => {
    const handleCloseBanner = () => setIsClosing(true);
    window.addEventListener(
      STATUSPAL_NEXT_CLOSE_BANNER_EVENT,
      handleCloseBanner
    );

    return () =>
      window.removeEventListener(
        STATUSPAL_NEXT_CLOSE_BANNER_EVENT,
        handleCloseBanner
      );
  }, []);

  // Position classes for Tailwind
  const positionClasses = {
    'top-left': 'top-8 left-8',
    'top-right': 'top-8 right-8',
    'bottom-left': 'bottom-8 left-8',
    'bottom-right': 'bottom-8 right-8'
  };

  const IconComponent = (() => {
    if (currentNotice.notice_type === 'maintenance') return WrenchIcon;
    if (currentNotice.notice_type === 'info') return InformationCircleIcon;
    return ExclamationTriangleIcon;
  })();

  const closeBanner = (): void => {
    setIsClosing(true);

    if (!window.StatusPalNextWidgetConfig.demo)
      dismissNotice(currentNotice.id, currentNotice.state);
  };

  const humanizedDuration = (): string => {
    const diff = dayjs.duration(
      dayjs(currentNotice.ends_at || undefined).diff(
        dayjs(currentNotice.starts_at)
      )
    );
    const parts = [];

    const formatUnit = (value: number, unit: string): string =>
      value === 1 ? `${value} ${unit}` : `${value} ${unit}s`;

    if (diff.asMinutes() < 1) {
      parts.push(formatUnit(Math.max(0, diff.seconds()), 'second'));
    } else {
      const d = diff.days(),
        h = diff.hours(),
        m = diff.minutes();

      if (d) parts.push(formatUnit(d, 'day'));
      if (h) parts.push(formatUnit(h, 'hour'));
      if (m) parts.push(formatUnit(m, 'minute'));
    }

    const duration = parts.join(' ');

    if (currentNotice.state === 'planned')
      return `Starts at: ${dayjs(currentNotice.starts_at).format('YYYY-MM-DD HH:mm')}${currentNotice.ends_at ? ` · Duration: ${duration}` : ''}`;

    return currentNotice.notice_type === 'maintenance'
      ? `Started at: ${dayjs(currentNotice.starts_at).format('YYYY-MM-DD HH:mm')}${currentNotice.ends_at ? ` · Duration: ${duration}` : ''}`
      : `Ongoing for ${duration}`;
  };

  return (
    <div
      className={`
        fixed z-[999999] max-w-96 font-sans bg-transparent leading-5
        ${!options.noEnterAnimation ? 'animate-[banner-enter_0.5s_cubic-bezier(0.34,1.56,0.64,1)]' : ''}
        max-sm:max-w-none max-sm:inset-x-4
        ${positionClasses[position]}
        ${position.includes('right') ? 'banner-slide-right' : 'banner-slide-left'}
        ${position.includes('top') ? 'max-sm:top-4' : 'max-sm:bottom-4'}
      `}
      {...(theme !== 'auto' ? { 'data-theme': theme } : {})}
    >
      <div
        ref={bannerRef}
        className={`
          rounded shadow-2xl flex p-4 max-sm:p-2 gap-5 max-sm:gap-3
          ${statusColors(currentNotice.notice_type, currentNotice.severity)}
          ${
            isClosing
              ? 'animate-[banner-exit_0.3s_ease-in_forwards]'
              : visibleNotices.length !== notices.length
                ? 'animate-[banner-fade-in_0.2s_ease-in]'
                : ''
          }
        `}
      >
        <IconComponent className="size-8 min-w-fit" />

        <div className="flex flex-col gap-3 max-sm:gap-2 w-full">
          <div className="flex justify-between gap-3">
            <strong>{currentNotice.title}</strong>
            <button
              className="btn btn-sm btn-ghost btn-circle transition-all opacity-60"
              onClick={closeBanner}
              title="Close"
              aria-label="Close banner"
            >
              <XMarkIcon className="size-5" />
            </button>
          </div>

          <span className="leading-4">
            {Object.keys(currentNotice.affected_services).length ? (
              <Fragment>
                Affected services:{' '}
                <i>
                  {Object.entries(currentNotice.affected_services)
                    .map(
                      ([serviceId, containerNames]) =>
                        `${services.find(service => service.id === serviceId)?.name} (${containerNames.join(', ')})`
                    )
                    .join('. ')}
                </i>
              </Fragment>
            ) : (
              'No affected services'
            )}
          </span>

          <small className="leading-4">{humanizedDuration()}</small>

          <a
            href={origin}
            className="underline hover:opacity-50 transition-opacity text-inherit"
            target="_blank"
            rel="noreferrer"
          >
            View latest updates
          </a>
        </div>
      </div>
    </div>
  );
};

export default Banner;
