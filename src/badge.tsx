import './badge.css';
import { useRef } from 'preact/hooks';
import { StatusResponse } from 'types/general';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';
import { statusColors } from './helpers';

const Badge = ({
  data: { status_page },
  config: {
    badge: { placement, theme }
  },
  element,
  options = {}
}: {
  data: StatusResponse;
  config: ReturnType<typeof window.NoticelyWidget.getConfig>;
  element: HTMLElement;
  options?: { noEnterAnimation?: boolean };
}) => {
  const elementRef = useRef<HTMLElement>(element);

  const getTheme = () => {
    if (theme === 'auto')
      return window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    return theme;
  };

  const tooltipText = () => {
    if (status_page.current_status.severity === 'major')
      return 'Ongoing major incident';
    if (status_page.current_status.severity === 'minor')
      return 'Ongoing minor incident';
    if (status_page.current_status.notice_type === 'incident')
      return 'Ongoing incident';
    if (status_page.current_status.notice_type === 'maintenance')
      return 'Ongoing maintenance';
    return 'All systems operational';
  };
  return (
    <Tippy
      content={tooltipText()}
      reference={elementRef}
      className="opacity-90"
      theme={getTheme()}
      placement={placement}
    >
      <span
        className={`
          inline-block size-4 rounded-full relative
          ${!options.noEnterAnimation ? 'animate-[badge-enter_0.5s_cubic-bezier(0.34,1.56,0.64,1)]' : ''}
          ${statusColors(status_page.current_status.notice_type, status_page.current_status.severity)}
        `}
        {...(theme !== 'auto' ? { 'data-theme': theme } : {})}
      >
        <span
          className={`
            bg-inherit rounded-full animate-ping absolute inset-0
            ${status_page.current_status.severity === 'ok' ? 'opacity-30' : 'opacity-50'}
          `}
        />
      </span>
    </Tippy>
  );
};

export default Badge;
