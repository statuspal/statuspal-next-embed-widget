export type StatusResponse = {
  ongoing_notices: Notice[];
  services: Service[];
  status_page: StatusPage;
};

export type Notice = {
  id: string;
  title: string;
  notice_type: 'maintenance' | 'incident';
  starts_at: string;
  ends_at?: string | null;
  severity?: 'major' | 'minor' | '' | null;
  affected_services: { [key: string]: string[] };
};

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
