// Sky-blue themed status and severity badges
export const StatusBadge = ({ status }) => {
  const map = {
    submitted:    'badge-blue',
    under_review: 'badge-yellow',
    in_progress:  'badge-orange',
    resolved:     'badge-green',
    closed:       'badge-gray',
  };
  const dot = {
    submitted:    'bg-sky-400',
    under_review: 'bg-yellow-400',
    in_progress:  'bg-orange-400',
    resolved:     'bg-emerald-400',
    closed:       'bg-gray-500',
  };
  return (
    <span className={`badge ${map[status] || 'badge-gray'}`}>
      <span className={`w-1.5 h-1.5 rounded-full inline-block ${dot[status] || 'bg-gray-400'}`} />
      {status?.replace(/_/g, ' ')}
    </span>
  );
};

export const SeverityBadge = ({ severity }) => {
  const map = {
    low:      'badge-green',
    medium:   'badge-yellow',
    high:     'badge-orange',
    critical: 'badge-red',
  };
  return (
    <span className={`badge ${map[severity] || 'badge-gray'}`}>
      {severity}
    </span>
  );
};

export default StatusBadge;
