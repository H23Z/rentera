// app/profile/owner/[id]/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/firebase/firebase';
import { useAuth } from '@/hooks/useAuth';
import OwnerCard from '@/app/components/profile/OwnerCard';
import OwnerListings from '@/app/components/profile/OwnerListings';
import { Separator } from '@/components/ui/separator';
import CommentSection from '@/app/components/comments/CommentSection';

export default function OwnerProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const { id } = useParams(); // ⚡ получаем [id] из URL
  const [owner, setOwner] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOwner = async () => {
      if (!id || typeof id !== 'string') return;

      try {
        const docRef = doc(db, 'owner', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setOwner(docSnap.data());
        } else {
          console.warn('Профиль владельца не найден');
        }
      } catch (error) {
        console.error('Ошибка при загрузке профиля:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchOwner();
    }
  }, [id, authLoading]);

  if (authLoading || loading) {
    return <p className="text-center mt-10 text-muted-foreground">Загрузка профиля...</p>;
  }

  if (!owner) {
    return <p className="text-center mt-10 text-destructive">Профиль не найден</p>;
  }

  const isOwner = user?.uid === id; // 🔑 ты просматриваешь свой профиль?

  return (
    <div className="min-h-screen bg-background py-8 px-4 md:px-10 space-y-8">
      <OwnerCard owner={owner} isCurrentUser={isOwner} />
      <Separator className="my-4" />
      <OwnerListings ownerId={typeof id === 'string' ? id : ''} currentUserId={user?.uid ?? ''} />
      <Separator className="my-4" />
      <CommentSection
        userRole="owner"
        currentUserId={user?.uid ?? ''}
        contextType="owner"
        contextId={typeof id === 'string' ? id : ''}
      />
    </div>
  );
}
