export type StatusResponse = {
  ongoing_notices: Notice[];
  planned_notices: Notice[];
  services: Service[];
  status_page: StatusPage;
};

export type Notice = {
  id: string;
  title: string;
  notice_type: 'maintenance' | 'incident' | 'info';
  starts_at: string;
  ends_at?: string | null;
  severity?: 'major' | 'minor' | '' | null;
  affected_services: { [key: string]: string[] };
};

export type NoticeState = 'planned' | 'ongoing';

export type NoticeWithState = Notice & { state: NoticeState };

export type Service = {
  id: string;
  name: string;
};

export type StatusPage = {
  current_status: {
    notice_type: 'maintenance' | 'incident' | null;
    severity: 'ok' | 'maintenance' | 'no_severity' | 'minor' | 'major';
  };
};

export type ErrorResponse = {
  error: string;
};
