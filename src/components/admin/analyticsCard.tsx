// components/admin/AnalyticsCards.tsx
type AnalyticsProps = {
  totalMentors: number;
  totalMentees: number;
  totalUnassigned: number;
};

export default function AnalyticsCards({ totalMentors, totalMentees, totalUnassigned }: AnalyticsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
      <div className="p-4 h-40 bg-white dark:bg-orange-50 shadow rounded">Total Mentors: {totalMentors}</div>
      <div className="p-4 h-40 bg-white dark:bg-orange-50 shadow rounded">Total Mentees: {totalMentees}</div>
      <div className="p-4 h-40 bg-white dark:bg-orange-50 shadow rounded">Unassigned Mentees: {totalUnassigned}</div>
    </div>
  );
}
