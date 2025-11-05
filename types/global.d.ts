type Theme = 'auto' | 'light' | 'dark';
type BannerPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
type BadgePlacement = 'top' | 'bottom' | 'left' | 'right';

// Global types
declare interface Window {
  NoticelyWidget: {
    create: () => Promise<void>;
    destroy: (options?: {
      onlyBanner?: boolean;
      animationEnded?: boolean;
    }) => void;
    getConfig: () => {
      origin?: string;
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
  NoticelyWidgetConfig?: {
    origin?: string;
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
}
