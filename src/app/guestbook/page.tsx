import { Metadata } from 'next';
import { GuestbookApp } from '@/components/guestbook/GuestbookApp';

export const metadata: Metadata = {
  title: 'Guestbook',
  description: "Leave a message on Yuji Min's guestbook",
  openGraph: {
    title: 'Guestbook | yujimin.dev',
    description: "Leave a message on Yuji Min's guestbook",
    images: ['/images/ogImages/guestbook_og_img.png'],
  },
};

export default function GuestbookPage() {
  return <GuestbookApp />;
}
