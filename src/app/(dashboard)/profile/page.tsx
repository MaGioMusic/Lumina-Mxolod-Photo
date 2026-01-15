import { UnderConstruction } from '@/components/underConstruction';

export default function ProfilePage() {
  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1200px]">
        <UnderConstruction
          title="Profile Dashboard — Under Construction"
          description="We’re rebuilding this dashboard from scratch. Some sections may return soon."
          backHref="/"
          backLabel="Back to home"
        />
      </div>
    </div>
  );
}
