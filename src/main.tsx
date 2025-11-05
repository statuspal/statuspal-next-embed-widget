import './main.css';
import { render } from 'preact';
import { StatusResponse } from 'types/general';
import Banner from './banner';
import Badge from './badge';
import testResponse from './test-response';

export const NOTICELY_BANNER_CONTAINER_ID = 'noticely-banner-container';
export const NOTICELY_BANNER_LOCAL_STORAGE_KEY = 'noticely-viewed-notices';
export const NOTICELY_BADGE_CONTAINER_CLASS = 'noticely-badge';
export const NOTICELY_CLOSE_BANNER_EVENT = 'noticely-close-banner';
export const REFRESH_INTERVAL = 60000; // ms

let interval: number | null = null;
let previousStatus = '';

// Global API setup
window.NoticelyWidget = {
  create: async (): Promise<void> => {
    clearInterval(interval);

    // Read configuration from global window object
    const config = window.NoticelyWidget.getConfig();

    if (!config.origin) {
      console.error(
        'Noticely Widget: Configuration not found. Please provide `window.NoticelyWidgetConfig` object with at least a `origin` property.'
      );
      return;
    }

    // Destroy existing widget first
    window.NoticelyWidget.destroy();

    // Check if widget is enabled (default true)
    if (!config.globalEnabled) return;

    await renderWidget();
    interval = setInterval(
      async () => await renderWidget({ noEnterAnimation: true }),
      REFRESH_INTERVAL
    );
  },
  destroy: (options = {}): void => {
    if (options.onlyBanner && !options.animationEnded) {
      window.dispatchEvent(new CustomEvent(NOTICELY_CLOSE_BANNER_EVENT));
      return;
    }

    const config = window.NoticelyWidget.getConfig();

    // Find and remove the banner container
    const container = document.getElementById(NOTICELY_BANNER_CONTAINER_ID);
    if (container) {
      render(null, container);
      container.remove();
    }

    if (options.onlyBanner) return;

    clearInterval(interval);

    document
      .querySelectorAll(
        `:where(${config.badge.selector}) .${NOTICELY_BADGE_CONTAINER_CLASS}`
      )
      .forEach(container => {
        render(null, container);
        container.remove();
      });
  },
  getConfig: (): ReturnType<typeof window.NoticelyWidget.getConfig> => {
    const {
      origin,
      enabled: defaultEnabled = true,
      theme: defaultTheme = 'auto',
      banner = {},
      badge = {}
    } = window.NoticelyWidgetConfig || {};
    const {
      position: bannerPosition = 'bottom-right',
      theme: bannerTheme = defaultTheme,
      enabled: bannerEnabled = defaultEnabled
    } = banner;
    const {
      placement: badgePlacement = 'right',
      theme: badgeTheme = defaultTheme,
      enabled: badgeEnabled = false,
      selector: badgeSelector = '.noticely-badge-container'
    } = badge;

    return {
      origin,
      globalEnabled: bannerEnabled || badgeEnabled,
      banner: {
        position: bannerPosition,
        theme: bannerTheme,
        enabled: bannerEnabled
      },
      badge: {
        placement: badgePlacement,
        theme: badgeTheme,
        enabled: badgeEnabled,
        selector: badgeSelector
      }
    };
  }
};

const renderWidget = async (
  options: { noEnterAnimation?: boolean } = {}
): Promise<void> => {
  const config = window.NoticelyWidget.getConfig();

  let data: StatusResponse;
  try {
    const response = await fetch(`${config.origin}/api/v1/status`);
    data = await response.json();
  } catch (error) {
    console.error(error);
    if (!window.NoticelyWidgetConfig.demo) return;

    data = testResponse;
  }

  if (window.NoticelyWidgetConfig.demo && !data.ongoing_notices.length)
    data = testResponse;

  if (config.banner.enabled) {
    if (!window.NoticelyWidgetConfig.demo) {
      const viewedNoticeIds = JSON.parse(
        localStorage.getItem(NOTICELY_BANNER_LOCAL_STORAGE_KEY) || '[]'
      );
      data.ongoing_notices = data.ongoing_notices.filter(
        notice => !viewedNoticeIds.includes(notice.id)
      );
    }

    if (data.ongoing_notices.length) {
      // Find existing container or create new one
      let container = document.getElementById(NOTICELY_BANNER_CONTAINER_ID);
      const isInitialRender = !container;
      if (!container) {
        container = document.createElement('div');
        container.id = NOTICELY_BANNER_CONTAINER_ID;
        document.body.appendChild(container);
      } else {
        render(null, container); // Clear previous render
      }

      // Render the banner into the container
      render(
        <Banner
          data={data}
          config={config}
          options={{
            ...options,
            noEnterAnimation: !isInitialRender && options.noEnterAnimation
          }}
        />,
        container
      );
    } else {
      window.NoticelyWidget.destroy({ onlyBanner: true });
    }
  }

  if (!config.badge.enabled) return;

  const badgeElements = document.querySelectorAll(config.badge.selector);

  if (!badgeElements.length) {
    console.error(
      `Noticely Widget: No elements found for badge selector "${config.badge.selector}".`
    );
    return;
  }

  const currentStatus = JSON.stringify(data.status_page.current_status);

  badgeElements.forEach(badgeElement => {
    let container = badgeElement.querySelector(
      `.${NOTICELY_BADGE_CONTAINER_CLASS}`
    );
    if (!container) {
      container = document.createElement('span');
      container.classList.add(
        NOTICELY_BADGE_CONTAINER_CLASS,
        'align-middle',
        'ml-2',
        'inline-flex'
      );
      badgeElement.appendChild(container);
    } else {
      render(null, container); // Clear previous render
    }

    render(
      <Badge
        data={data}
        config={config}
        element={badgeElement as HTMLElement}
        options={{
          ...options,
          noEnterAnimation:
            previousStatus === currentStatus && options.noEnterAnimation
        }}
      />,
      container
    );
  });

  previousStatus = currentStatus;
};

if (document.readyState === 'loading')
  document.addEventListener('DOMContentLoaded', window.NoticelyWidget.create);
else window.NoticelyWidget.create();
