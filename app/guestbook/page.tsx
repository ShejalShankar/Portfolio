import { auth } from 'app/auth';
import { GuestbookAuthForm } from 'app/components/guestbook/guestbook-auth-form';
import { GuestbookEntries } from 'app/components/guestbook/guestbook-entries';
import { GuestbookEntryData } from 'app/components/guestbook/guestbook-entry-data';
import { GuestbookHeader } from 'app/components/guestbook/guestbook-header';
import { saveGuestbookEntry } from 'app/db/actions';
import { getGuestbookEntries } from 'app/db/queries';
import { Suspense } from 'react';

export const metadata = {
  title: 'Guestbook',
  description: 'Sign my guestbook and leave your mark.',
};

export default function GuestbookPage() {
  return (
    <section>
      <GuestbookHeader
        title="sign my guestbook"
        description="Leave your mark on my guestbook. Say hi, ask a question, or share your thoughts."
      />

      <Suspense>
        <GuestbookContent />
      </Suspense>
    </section>
  );
}

async function GuestbookContent() {
  let session = await auth();
  let entries = await getGuestbookEntries();

  return (
    <>
      <GuestbookAuthForm
        isAuthenticated={!!session?.user}
        onSubmit={saveGuestbookEntry}
      />

      <GuestbookEntries
        entries={entries as GuestbookEntryData[]}
        showEmptyMessage={true}
        emptyMessage="No entries yet. Be the first to sign!"
      />
    </>
  );
}
