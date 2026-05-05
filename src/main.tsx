import './main.css';
import { render } from 'preact';
import { StatusResponse, ErrorResponse } from 'types/general';
import Banner from './banner';
import Badge from './badge';
import testResponse from './test-response';

export const STATUSPAL_NEXT_BANNER_CONTAINER_ID =
  'statuspal-next-banner-container';
export const STATUSPAL_NEXT_BANNER_LOCAL_STORAGE_KEY =
  'statuspal-next-viewed-notices';
export const STATUSPAL_NEXT_BADGE_CONTAINER_CLASS = 'statuspal-next-badge';
export const STATUSPAL_NEXT_CLOSE_BANNER_EVENT = 'statuspal-next-close-banner';
export const REFRESH_INTERVAL = 60000; // ms

let interval: number | null = null;
let previousStatus = '';

// For backwards compatibility
if (!window.StatusPalNextWidgetConfig)
  window.StatusPalNextWidgetConfig = window.NoticelyWidgetConfig;

// Global API setup
window.StatusPalNextWidget = {
  create: async (): Promise<void> => {
    clearInterval(interval);

    // Read configuration from global window object
    const config = window.StatusPalNextWidget.getConfig();

    if (!config.origin) {
      console.error(
        'StatusPal Next Widget: Configuration not found. Please provide `window.StatusPalNextWidgetConfig` object with at least a `origin` property.'
      );
      return;
    }

    // Destroy existing widget first
    window.StatusPalNextWidget.destroy();

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
      window.dispatchEvent(new CustomEvent(STATUSPAL_NEXT_CLOSE_BANNER_EVENT));
      return;
    }

    const config = window.StatusPalNextWidget.getConfig();

    // Find and remove the banner container
    const container = document.getElementById(
      STATUSPAL_NEXT_BANNER_CONTAINER_ID
    );
    if (container) {
      render(null, container);
      container.remove();
    }

    if (options.onlyBanner) return;

    clearInterval(interval);

    document
      // added .noticely-badge-container to support backwards compatibility
      .querySelectorAll(
        `:where(${config.badge.selector}, .noticely-badge-container) .${STATUSPAL_NEXT_BADGE_CONTAINER_CLASS}`
      )
      .forEach(container => {
        render(null, container);
        container.remove();
      });
  },
  getConfig: (): ReturnType<typeof window.StatusPalNextWidget.getConfig> => {
    const {
      origin,
      enabled: defaultEnabled = true,
      theme: defaultTheme = 'auto',
      banner = {},
      badge = {}
    } = window.StatusPalNextWidgetConfig || {};
    const {
      position: bannerPosition = 'bottom-right',
      theme: bannerTheme = defaultTheme,
      enabled: bannerEnabled = defaultEnabled
    } = banner;
    const {
      placement: badgePlacement = 'right',
      theme: badgeTheme = defaultTheme,
      enabled: badgeEnabled = false,
      selector: badgeSelector = '.statuspal-next-badge-container'
    } = badge;

    return {
      origin: origin?.replace(/\/$/, ''),
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

// For backwards compatibility
window.NoticelyWidget = window.StatusPalNextWidget;

const renderWidget = async (
  options: { noEnterAnimation?: boolean } = {}
): Promise<void> => {
  const config = window.StatusPalNextWidget.getConfig();

  let data: StatusResponse;

  try {
    const response = await fetch(`${config.origin}/api/v1/status`);
    const json = await response.json();

    if (!response.ok) {
      const errorResponse = json as ErrorResponse;
      throw new Error(
        `API request failed with status ${response.status}: ${errorResponse.error || response.statusText}`
      );
    }

    data = json;
  } catch (error) {
    console.error(error);
    if (!window.StatusPalNextWidgetConfig.demo) return;

    data = testResponse;
  }

  if (window.StatusPalNextWidgetConfig.demo && !data.ongoing_notices.length)
    data = testResponse;

  if (config.banner.enabled) {
    if (!window.StatusPalNextWidgetConfig.demo) {
      const viewedNoticeIds = JSON.parse(
        localStorage.getItem(STATUSPAL_NEXT_BANNER_LOCAL_STORAGE_KEY) || '[]'
      );
      data.ongoing_notices = data.ongoing_notices.filter(
        notice => !viewedNoticeIds.includes(notice.id)
      );
    }

    if (data.ongoing_notices.length) {
      // Find existing container or create new one
      let container = document.getElementById(
        STATUSPAL_NEXT_BANNER_CONTAINER_ID
      );
      const isInitialRender = !container;
      if (!container) {
        container = document.createElement('div');
        container.id = STATUSPAL_NEXT_BANNER_CONTAINER_ID;
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
      window.StatusPalNextWidget.destroy({ onlyBanner: true });
    }
  }

  if (!config.badge.enabled) return;

  // added .noticely-badge-container to support backwards compatibility
  const badgeElements = document.querySelectorAll(
    `:where(${config.badge.selector}, .noticely-badge-container)`
  );

  if (!badgeElements.length) {
    console.error(
      `StatusPal Next Widget: No elements found for badge selector "${config.badge.selector}".`
    );
    return;
  }

  const currentStatus = JSON.stringify(data.status_page.current_status);

  badgeElements.forEach(badgeElement => {
    let container = badgeElement.querySelector(
      `.${STATUSPAL_NEXT_BADGE_CONTAINER_CLASS}`
    );
    if (!container) {
      container = document.createElement('span');
      container.classList.add(
        STATUSPAL_NEXT_BADGE_CONTAINER_CLASS,
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
  document.addEventListener(
    'DOMContentLoaded',
    window.StatusPalNextWidget.create
  );
else window.StatusPalNextWidget.create();
