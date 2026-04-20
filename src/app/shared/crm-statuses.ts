// CRM pipeline statuses used across dashboard and any status-aware component.

export interface CrmStatus {
  value: string;
  label: string;
}

export const CRM_STATUSES: CrmStatus[] = [
  { value: 'pending',          label: 'Pending' },
  { value: 'portfolio',        label: 'Portfolio Company' },
  { value: 'active',           label: 'Active' },
  { value: 'decision_needed',  label: 'Decision To Be Taken' },
  { value: 'dm_call',          label: 'DM Call Setup / TBD' },
  { value: 'deep_dive',        label: 'Need To Deep Dive' },
  { value: 'update_requested', label: 'Update Requested / Founder Followed Up' },
  { value: 'intro_call_done',  label: 'Introductory Call Done' },
  { value: 'wait_watch',       label: 'Wait and Watch' },
  { value: 'tracking',         label: 'Tracking' },
  { value: 'not_raising',      label: 'Not Raising, Introductory Call Done' },
  { value: 'will_raise',       label: 'Will Raise Soon' },
  { value: 'early_undecided',  label: 'Early, Undecided' },
  { value: 'connected_tbd',    label: 'Connected, Calls To Be Decided' },
  { value: 'unresponsive',     label: 'Founder Unresponsive' },
  { value: 'not_fit',          label: 'Not a Fit' },
  { value: 'evaluated_pass',   label: 'Evaluated, Pass' },
  { value: 'pass',             label: 'Pass' },
];
