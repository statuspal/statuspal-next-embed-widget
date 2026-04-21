type Theme = 'auto' | 'light' | 'dark';
type BannerPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
type BadgePlacement = 'top' | 'bottom' | 'left' | 'right';

// Global types
declare interface Window {
  StatusPalNextWidget: {
    create: () => Promise<void>;
    destroy: (options?: {
      onlyBanner?: boolean;
      animationEnded?: boolean;
    }) => void;
    getConfig: () => {
      origin?: string;
      token?: string;
      globalEnabled: boolean;
      banner: {
        position: BannerPosition;
        theme: Theme;
        enabled: boolean;
      };
      badge: {
        placement: BadgePlacement;
        theme: Theme;
        enabled: boolean;
        selector: string;
      };
    };
  };
  StatusPalNextWidgetConfig?: {
    origin?: string;
    token?: string;
    enabled?: boolean;
    theme?: Theme;
    demo?: boolean;
    banner?: {
      position?: BannerPosition;
      theme?: Theme;
      enabled?: boolean;
    };
    badge?: {
      placement?: BadgePlacement;
      theme?: Theme;
      enabled?: boolean;
      selector?: string;
    };
  };
  // For backwards compatibility
  NoticelyWidget: Window['StatusPalNextWidget'];
  NoticelyWidgetConfig?: Window['StatusPalNextWidgetConfig'];
}
