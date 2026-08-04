interface TeamMember {
  role: string;
  since: number;
  bio: string;
}

export function TeamGrid({ team }: { team: TeamMember[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {team.map((member) => (
        <div key={member.role} className="rounded-lg border border-border bg-canvas p-6">
          <p className="font-semibold text-navy">{member.role}</p>
          <p className="text-xs uppercase tracking-widest text-accent-blue">Since {member.since}</p>
          <p className="mt-3 text-sm text-slate">{member.bio}</p>
        </div>
      ))}
    </div>
  );
}
